import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data as Profile | null;
});

/**
 * Pour les pages /admin : exige une session valide rattachée au restaurant
 * courant (celui résolu par le proxy). Redirige vers /admin/login sinon.
 */
export async function requireOwnerForCurrentRestaurant(restaurantId: string): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/admin/login");
  if (profile.role !== "superadmin" && profile.restaurant_id !== restaurantId) {
    redirect("/admin/login?error=acces-refuse");
  }

  return profile;
}
