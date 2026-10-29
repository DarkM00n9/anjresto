"use server";

import { requireAdminContext } from "./guard";
import { createClient } from "@/lib/supabase/server";

/** Nombre total de réservations reçues : sert à détecter les nouvelles arrivées. */
export async function getReservationCounter(): Promise<number> {
  const { restaurant } = await requireAdminContext();
  const supabase = await createClient();
  const { count } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);
  return count ?? 0;
}
