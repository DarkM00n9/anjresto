import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { todayInParis } from "@/lib/closures";
import type { Reservation } from "@/types/database";

export const listTodayAndTomorrowReservations = cache(
  async (restaurantId: string): Promise<Reservation[]> => {
    const supabase = await createClient();
    const today = todayInParis();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString("en-CA", {
      timeZone: "Europe/Paris",
    });

    const { data } = await supabase
      .from("reservations")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .in("reservation_date", [today, tomorrow])
      .order("reservation_date", { ascending: true })
      .order("reservation_time", { ascending: true });

    return (data ?? []) as Reservation[];
  },
);
