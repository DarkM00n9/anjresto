"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dailyMenuSchema, type DailyMenuInput } from "@/lib/schemas";
import { requireAdminContext } from "./guard";
import { translateToEnglish } from "@/lib/translate";

/** Un seul menu du jour par restaurant et par date : upsert sur (restaurant_id, valid_date). */
export async function upsertDailyMenu(input: DailyMenuInput) {
  const { restaurant } = await requireAdminContext();
  const data = dailyMenuSchema.parse(input);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("daily_menus")
    .select("id")
    .eq("restaurant_id", restaurant.id)
    .eq("valid_date", data.valid_date)
    .maybeSingle();

  const en = await translateToEnglish({ title: data.title, starter: data.starter, main: data.main, dessert: data.dessert });
  const payload = {
    title_en: en.title ?? null,
    starter_en: en.starter ?? null,
    main_en: en.main ?? null,
    dessert_en: en.dessert ?? null,
    title: data.title,
    starter: data.starter || null,
    main: data.main || null,
    dessert: data.dessert || null,
    price: data.price,
    valid_date: data.valid_date,
    is_active: data.is_active,
  };

  if (existing) {
    await supabase.from("daily_menus").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("daily_menus").insert({ ...payload, restaurant_id: restaurant.id });
  }

  revalidatePath("/carte");
}

export async function deleteDailyMenu(dailyMenuId: string) {
  const { restaurant } = await requireAdminContext();
  const supabase = await createClient();

  await supabase.from("daily_menus").delete().eq("id", dailyMenuId).eq("restaurant_id", restaurant.id);

  revalidatePath("/carte");
}
