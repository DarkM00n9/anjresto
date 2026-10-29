"use server";

import { revalidatePath } from "next/cache";
import { requireAdminContext } from "./guard";
import { createClient } from "@/lib/supabase/server";

export async function saveCustomerNote(phone: string, note: string, isVip: boolean) {
  const { restaurant } = await requireAdminContext();
  const supabase = await createClient();
  const { error } = await supabase.from("customer_notes").upsert({
    restaurant_id: restaurant.id,
    phone,
    note: note.trim().slice(0, 500) || null,
    is_vip: isVip,
    updated_at: new Date().toISOString(),
  });
  if (error) return { success: false, error: "Impossible d'enregistrer." };
  revalidatePath("/admin/clients");
  return { success: true };
}
