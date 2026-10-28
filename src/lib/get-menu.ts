import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Category, MenuItem, OpeningHour } from "@/types/database";

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
