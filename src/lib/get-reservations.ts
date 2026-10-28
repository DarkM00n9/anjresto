import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { addDays, todayInParis } from "@/lib/datetime";
import { defaultReservationSettings } from "@/lib/reservations/availability";
import type { BlockedService, Reservation, ReservationSettings } from "@/types/database";

export const listTodayAndTomorrowReservations = cache(
  async (restaurantId: string): Promise<Reservation[]> => {
    const supabase = await createClient();
    const today = todayInParis();
    const tomorrow = addDays(today, 1);

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

export const listReservationsForDate = cache(
  async (restaurantId: string, date: string): Promise<Reservation[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("reservation_date", date)
      .order("reservation_time", { ascending: true });

    return (data ?? []) as Reservation[];
  },
);

export const getReservationSettings = cache(
  async (restaurantId: string): Promise<ReservationSettings> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reservation_settings")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    return (data as ReservationSettings | null) ?? defaultReservationSettings(restaurantId);
  },
);

export const getBlockedServices = cache(
  async (restaurantId: string, date?: string): Promise<BlockedService[]> => {
    const supabase = await createClient();
    let query = supabase.from("blocked_services").select("*").eq("restaurant_id", restaurantId);
    if (date) query = query.eq("date", date);

    const { data } = await query;
    return (data ?? []) as BlockedService[];
  },
);
