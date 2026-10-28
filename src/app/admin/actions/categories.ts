"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema, type CategoryInput } from "@/lib/schemas";
import { requireAdminContext } from "./guard";

export async function createCategory(input: CategoryInput) {
  const { restaurant } = await requireAdminContext();
  const data = categorySchema.parse(input);
  const supabase = await createClient();

  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);

  await supabase.from("categories").insert({
    restaurant_id: restaurant.id,
    name: data.name,
    description: data.description || null,
    display_order: count ?? 0,
  });

  revalidatePath("/carte");
  revalidatePath("/");
}

export async function updateCategory(categoryId: string, input: CategoryInput) {
  const { restaurant } = await requireAdminContext();
  const data = categorySchema.parse(input);
  const supabase = await createClient();

  await supabase
    .from("categories")
    .update({ name: data.name, description: data.description || null })
    .eq("id", categoryId)
    .eq("restaurant_id", restaurant.id);

  revalidatePath("/carte");
}

export async function deleteCategory(categoryId: string) {
  const { restaurant } = await requireAdminContext();
  const supabase = await createClient();

  await supabase.from("categories").delete().eq("id", categoryId).eq("restaurant_id", restaurant.id);

  revalidatePath("/carte");
}

export async function reorderCategories(orderedIds: string[]) {
  const { restaurant } = await requireAdminContext();
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("categories")
        .update({ display_order: index })
        .eq("id", id)
        .eq("restaurant_id", restaurant.id),
    ),
  );

  revalidatePath("/carte");
}
