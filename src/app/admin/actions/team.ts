"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { buildPublicOrigin } from "@/lib/url";
import { OWNER_ONLY } from "@/lib/permissions";
import { requireAdminContext } from "./guard";

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail invalide"),
  full_name: z.string().trim().max(80).optional(),
  role: z.enum(["manager", "staff"]),
});

export async function inviteTeamMember(input: { email: string; full_name?: string; role: "manager" | "staff" }) {
  const { restaurant } = await requireAdminContext(OWNER_ONLY);
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  const { email, full_name, role } = parsed.data;

  const admin = createAdminClient();
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
  let userId = users.users.find((u) => u.email?.toLowerCase() === email)?.id;

  if (userId) {
    const { data: existing } = await admin.from("profiles").select("restaurant_id").eq("id", userId).maybeSingle();
    if (existing && existing.restaurant_id && existing.restaurant_id !== restaurant.id) {
      return { success: false, error: "Cette adresse est déjà utilisée par un autre restaurant." };
    }
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (error || !created.user) return { success: false, error: "Impossible de créer le compte." };
    userId = created.user.id;
  }

  const { error } = await admin
    .from("profiles")
    .upsert({ id: userId, role, restaurant_id: restaurant.id, full_name: full_name || null });
  if (error) return { success: false, error: "Impossible d'ajouter cette personne." };

  const baseUrl = buildPublicOrigin(restaurant, process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "");
  await sendEmail({
    to: email,
    subject: `Accès à l'administration de ${restaurant.name}`,
    html: `<p>Bonjour,</p><p>Vous avez été ajouté(e) à l'équipe de <strong>${restaurant.name}</strong>.</p>
      <p>Connectez-vous ici avec cette adresse e-mail (un lien de connexion sécurisé vous sera envoyé) :<br/>
      <a href="${baseUrl}/admin/login">${baseUrl}/admin/login</a></p>`,
  });

  revalidatePath("/admin/equipe");
  return { success: true };
}

export async function changeTeamRole(profileId: string, role: "manager" | "staff") {
  const { restaurant } = await requireAdminContext(OWNER_ONLY);
  if (role !== "manager" && role !== "staff") return;
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ role })
    .eq("id", profileId)
    .eq("restaurant_id", restaurant.id)
    .neq("role", "owner");
  revalidatePath("/admin/equipe");
}

export async function removeTeamMember(profileId: string) {
  const { restaurant } = await requireAdminContext(OWNER_ONLY);
  const admin = createAdminClient();
  await admin.from("profiles").delete().eq("id", profileId).eq("restaurant_id", restaurant.id).neq("role", "owner");
  revalidatePath("/admin/equipe");
}
