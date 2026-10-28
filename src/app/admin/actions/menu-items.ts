"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { menuItemSchema, type MenuItemInput } from "@/lib/schemas";
import { requireAdminContext } from "./guard";

export async function createMenuItem(input: MenuItemInput) {
  const { restaurant } = await requireAdminContext();
  const data = menuItemSchema.parse(input);
  const supabase = await createClient();

  const { count } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)
    .eq("category_id", data.category_id);

  await supabase.from("menu_items").insert({
    restaurant_id: restaurant.id,
    category_id: data.category_id,
    name: data.name,
    description: data.description || null,
    price: data.price,
    photo_url: data.photo_url || null,
    is_vegetarian: data.is_vegetarian,
    is_vegan: data.is_vegan,
    is_gluten_free: data.is_gluten_free,
    is_spicy: data.is_spicy,
    is_homemade: data.is_homemade,
    is_daily_special: data.is_daily_special,
    allergens: data.allergens,
    display_order: count ?? 0,
  });

  revalidatePath("/carte");
  revalidatePath("/");
}

export async function updateMenuItem(itemId: string, input: MenuItemInput) {
  const { restaurant } = await requireAdminContext();
  const data = menuItemSchema.parse(input);
  const supabase = await createClient();

  await supabase
    .from("menu_items")
    .update({
      category_id: data.category_id,
      name: data.name,
      description: data.description || null,
      price: data.price,
      photo_url: data.photo_url || null,
      is_vegetarian: data.is_vegetarian,
      is_vegan: data.is_vegan,
      is_gluten_free: data.is_gluten_free,
      is_spicy: data.is_spicy,
      is_homemade: data.is_homemade,
      is_daily_special: data.is_daily_special,
      allergens: data.allergens,
    })
    .eq("id", itemId)
    .eq("restaurant_id", restaurant.id);

  revalidatePath("/carte");
  revalidatePath("/");
}

export async function deleteMenuItem(itemId: string) {
  const { restaurant } = await requireAdminContext();
  const supabase = await createClient();

  await supabase.from("menu_items").delete().eq("id", itemId).eq("restaurant_id", restaurant.id);

  revalidatePath("/carte");
}

export async function duplicateMenuItem(itemId: string) {
  const { restaurant } = await requireAdminContext();
  const supabase = await createClient();

  const { data: original } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", itemId)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (!original) return;

  const { count } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)
    .eq("category_id", original.category_id);

  await supabase.from("menu_items").insert({
    restaurant_id: restaurant.id,
    category_id: original.category_id,
    name: `${original.name} (copie)`,
    description: original.description,
    price: original.price,
    photo_url: original.photo_url,
    is_available: true,
    is_daily_special: original.is_daily_special,
    is_vegetarian: original.is_vegetarian,
    is_vegan: original.is_vegan,
    is_gluten_free: original.is_gluten_free,
    is_spicy: original.is_spicy,
    is_homemade: original.is_homemade,
    allergens: original.allergens,
    display_order: count ?? 0,
  });

  revalidatePath("/carte");
}

export async function toggleMenuItemAvailability(itemId: string, isAvailable: boolean) {
  const { restaurant } = await requireAdminContext();
  const supabase = await createClient();

  await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", itemId)
    .eq("restaurant_id", restaurant.id);

  revalidatePath("/carte");
  revalidatePath("/");
}

export async function reorderMenuItems(orderedIds: string[]) {
  const { restaurant } = await requireAdminContext();
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("menu_items")
        .update({ display_order: index })
        .eq("id", id)
        .eq("restaurant_id", restaurant.id),
    ),
  );

  revalidatePath("/carte");
}
