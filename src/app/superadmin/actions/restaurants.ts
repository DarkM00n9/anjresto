"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { buildPublicOrigin } from "@/lib/url";
import { addDomainToVercel } from "@/lib/vercel";
import {
  createRestaurantSchema,
  customDomainSchema,
  menuImportSchema,
  type CreateRestaurantInput,
  type CustomDomainInput,
  type MenuImportInput,
} from "@/lib/schemas";
import type { Restaurant, RestaurantStatus } from "@/types/database";

function inviteEmailHtml(name: string, baseUrl: string): string {
  return `<!doctype html>
<html>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1f2937;">
    <p>Bonjour,</p>
    <p>Le site de <strong>${name}</strong> est prêt ! Pour accéder à votre espace de gestion
    (carte, horaires, réservations...), rendez-vous sur :</p>
    <p><a href="${baseUrl}/admin/login">${baseUrl}/admin/login</a></p>
    <p>Entrez votre adresse email : vous recevrez un lien de connexion sécurisé, pas de mot
    de passe à retenir.</p>
    <p>— ANJ Agency</p>
  </body>
</html>`;
}

export async function createRestaurant(input: CreateRestaurantInput) {
  await requireSuperadmin();
  const data = createRestaurantSchema.parse(input);
  const admin = createAdminClient();

  const { data: restaurant, error: insertError } = await admin
    .from("restaurants")
    .insert({
      id: data.id,
      slug: data.slug,
      name: data.name,
      status: "demo",
      logo_url: data.logo_url || null,
      theme: {
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        font_title: "Playfair Display",
        layout_style: data.layout_style,
      },
    })
    .select()
    .single();

  if (insertError || !restaurant) {
    return { success: false, error: "Ce slug est déjà utilisé." };
  }

  let ownerId: string;
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers.users.find((u) => u.email === data.owner_email);

  if (existing) {
    ownerId = existing.id;
  } else {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: data.owner_email,
      email_confirm: true,
    });
    if (createError || !created.user) {
      return { success: false, error: "Impossible de créer le compte du restaurateur." };
    }
    ownerId = created.user.id;
  }

  await admin
    .from("profiles")
    .upsert({ id: ownerId, role: "owner", restaurant_id: restaurant.id }, { onConflict: "id" });

  const baseUrl = buildPublicOrigin(restaurant as Restaurant, process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "");
  await sendEmail({
    to: data.owner_email,
    subject: `Votre site "${data.name}" est prêt`,
    html: inviteEmailHtml(data.name, baseUrl),
  });

  revalidatePath("/superadmin");
  return { success: true, restaurantId: restaurant.id as string };
}

export async function updateRestaurantStatus(restaurantId: string, status: RestaurantStatus) {
  await requireSuperadmin();
  const admin = createAdminClient();

  await admin.from("restaurants").update({ status }).eq("id", restaurantId);

  revalidatePath("/superadmin");
  revalidatePath(`/superadmin/${restaurantId}`);
}

export async function updateCustomDomain(restaurantId: string, input: CustomDomainInput) {
  await requireSuperadmin();
  const data = customDomainSchema.parse(input);
  const admin = createAdminClient();

  await admin
    .from("restaurants")
    .update({ custom_domain: data.custom_domain || null })
    .eq("id", restaurantId);

  const vercelResult = data.custom_domain
    ? await addDomainToVercel(data.custom_domain)
    : { success: true, skipped: true };

  revalidatePath(`/superadmin/${restaurantId}`);
  return vercelResult;
}

export async function importMenu(restaurantId: string, categories: MenuImportInput) {
  await requireSuperadmin();
  const data = menuImportSchema.parse(categories);
  const admin = createAdminClient();

  for (const [categoryIndex, category] of data.categories.entries()) {
    const { data: inserted, error } = await admin
      .from("categories")
      .insert({ restaurant_id: restaurantId, name: category.name, display_order: categoryIndex })
      .select()
      .single();
    if (error || !inserted) continue;

    const items = category.items.map((item, itemIndex) => ({
      restaurant_id: restaurantId,
      category_id: inserted.id,
      name: item.name,
      description: item.description || null,
      price: item.price,
      display_order: itemIndex,
    }));

    if (items.length > 0) {
      await admin.from("menu_items").insert(items);
    }
  }

  revalidatePath("/carte");
  redirect(`/superadmin/${restaurantId}`);
}

export async function updateBilling(
  restaurantId: string,
  input: { subscription_status: "trial" | "paid" | "unpaid"; paid_until: string; monthly_price: string },
) {
  await requireSuperadmin();
  const status = ["trial", "paid", "unpaid"].includes(input.subscription_status) ? input.subscription_status : "trial";
  const price = Math.max(0, Number(input.monthly_price.replace(",", ".")) || 0);
  const paidUntil = /^\d{4}-\d{2}-\d{2}$/.test(input.paid_until) ? input.paid_until : null;
  const admin = createAdminClient();
  const { error } = await admin
    .from("restaurants")
    .update({ subscription_status: status, paid_until: paidUntil, monthly_price: price })
    .eq("id", restaurantId);
  if (error) return { success: false, error: "Impossible d'enregistrer." };
  revalidatePath("/superadmin");
  revalidatePath(`/superadmin/${restaurantId}`);
  return { success: true };
}

/** Crée un nouveau restaurant en copiant le thème, la carte, les horaires et les réglages d'un modèle. */
export async function duplicateRestaurant(sourceId: string, newSlug: string, newName: string) {
  await requireSuperadmin();
  const slug = newSlug.trim().toLowerCase();
  if (!/^[a-z0-9-]{3,40}$/.test(slug) || newName.trim().length < 2) {
    return { success: false, error: "Nom ou adresse invalide (lettres minuscules, chiffres, tirets)." };
  }
  const admin = createAdminClient();
  const { data: source } = await admin.from("restaurants").select("*").eq("id", sourceId).maybeSingle();
  if (!source) return { success: false, error: "Modèle introuvable." };

  const { data: created, error } = await admin
    .from("restaurants")
    .insert({
      slug,
      name: newName.trim(),
      status: "demo",
      tagline: source.tagline,
      description: source.description,
      cuisine_type: source.cuisine_type,
      theme: source.theme,
    })
    .select()
    .single();
  if (error || !created) return { success: false, error: "Cette adresse est déjà utilisée." };

  const [{ data: categories }, { data: items }, { data: hours }, { data: settings }] = await Promise.all([
    admin.from("categories").select("*").eq("restaurant_id", sourceId),
    admin.from("menu_items").select("*").eq("restaurant_id", sourceId),
    admin.from("opening_hours").select("*").eq("restaurant_id", sourceId),
    admin.from("reservation_settings").select("*").eq("restaurant_id", sourceId).maybeSingle(),
  ]);

  const categoryMap = new Map<string, string>();
  for (const c of categories ?? []) {
    const { data: newCat } = await admin
      .from("categories")
      .insert({ restaurant_id: created.id, name: c.name, description: c.description, display_order: c.display_order })
      .select("id")
      .single();
    if (newCat) categoryMap.set(c.id, newCat.id);
  }

  const newItems = (items ?? [])
    .filter((i) => categoryMap.has(i.category_id))
    .map((i) => {
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = i;
      void _id; void _c; void _u;
      return { ...rest, restaurant_id: created.id, category_id: categoryMap.get(i.category_id)! };
    });
  if (newItems.length) await admin.from("menu_items").insert(newItems);

  const newHours = (hours ?? []).map((h) => {
    const { id: _id, ...rest } = h;
    void _id;
    return { ...rest, restaurant_id: created.id };
  });
  if (newHours.length) await admin.from("opening_hours").insert(newHours);

  if (settings) {
    const { id: _id, ...rest } = settings as Record<string, unknown>;
    void _id;
    await admin.from("reservation_settings").upsert({ ...rest, restaurant_id: created.id });
  }

  revalidatePath("/superadmin");
  return { success: true, restaurantId: created.id as string };
}
