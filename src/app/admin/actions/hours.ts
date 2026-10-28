"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hoursFormSchema, closureSchema, type HoursFormInput, type ClosureInput } from "@/lib/schemas";
import { requireAdminContext } from "./guard";

/** Remplace tous les horaires du restaurant (pas de ligne = jour fermé). */
export async function updateOpeningHours(input: HoursFormInput) {
  const { restaurant } = await requireAdminContext();
  const data = hoursFormSchema.parse(input);
  const supabase = await createClient();

  await supabase.from("opening_hours").delete().eq("restaurant_id", restaurant.id);

  const rows = data.days.flatMap((day) =>
    day.is_closed
      ? []
      : day.slots.map((slot) => ({
          restaurant_id: restaurant.id,
          day_of_week: day.day_of_week,
          opens_at: slot.opens_at,
          closes_at: slot.closes_at,
          is_closed: false,
        })),
  );

  if (rows.length > 0) {
    await supabase.from("opening_hours").insert(rows);
  }

  revalidatePath("/");
}

export async function createClosure(input: ClosureInput) {
  const { restaurant } = await requireAdminContext();
  const data = closureSchema.parse(input);
  const supabase = await createClient();

  await supabase.from("closures").insert({
    restaurant_id: restaurant.id,
    start_date: data.start_date,
    end_date: data.end_date,
    message: data.message || null,
  });

  revalidatePath("/");
}

export async function deleteClosure(closureId: string) {
  const { restaurant } = await requireAdminContext();
  const supabase = await createClient();

  await supabase.from("closures").delete().eq("id", closureId).eq("restaurant_id", restaurant.id);

  revalidatePath("/");
}
