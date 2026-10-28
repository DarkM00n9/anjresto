import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { todayInParis } from "@/lib/closures";
import type { Category, Closure, DailyMenu, MenuItem, OpeningHour } from "@/types/database";

export const getMenu = cache(async (restaurantId: string) => {
  const supabase = await createClient();

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("display_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("display_order", { ascending: true }),
  ]);

  return {
    categories: (categories ?? []) as Category[],
    items: (items ?? []) as MenuItem[],
  };
});

export const getOpeningHours = cache(async (restaurantId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("opening_hours")
    .select("*")
    .eq("restaurant_id", restaurantId);

  return (data ?? []) as OpeningHour[];
});

export const getClosures = cache(async (restaurantId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("closures")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .gte("end_date", todayInParis())
    .order("start_date", { ascending: true });

  return (data ?? []) as Closure[];
});

/** Le menu du jour actif aujourd'hui (s'il y en a un). */
export const getActiveDailyMenu = cache(async (restaurantId: string): Promise<DailyMenu | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_menus")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("valid_date", todayInParis())
    .eq("is_active", true)
    .maybeSingle();

  return data as DailyMenu | null;
});
