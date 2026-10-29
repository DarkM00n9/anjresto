import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayInParis } from "@/lib/datetime";
import type { Restaurant } from "@/types/database";

export interface RestaurantOverview extends Restaurant {
  reservationsThisMonth: number;
  ownerEmail: string | null;
  ownerLastSignInAt: string | null;
}

function firstOfMonth(): string {
  return `${todayInParis().slice(0, 7)}-01`;
}

/** Liste tous les restaurants avec leurs stats, pour /superadmin. */
export async function listRestaurantsOverview(): Promise<RestaurantOverview[]> {
  const supabase = createAdminClient();

  const [{ data: restaurants }, { data: reservations }, { data: profiles }, { data: usersPage }] =
    await Promise.all([
      supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("reservations").select("restaurant_id").gte("reservation_date", firstOfMonth()),
      supabase.from("profiles").select("id, restaurant_id").eq("role", "owner"),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ]);

  const reservationCounts = new Map<string, number>();
  for (const r of reservations ?? []) {
    reservationCounts.set(r.restaurant_id, (reservationCounts.get(r.restaurant_id) ?? 0) + 1);
  }

  const usersById = new Map((usersPage?.users ?? []).map((u) => [u.id, u]));
  const ownerIdByRestaurant = new Map<string, string>();
  for (const p of profiles ?? []) {
    if (p.restaurant_id) ownerIdByRestaurant.set(p.restaurant_id, p.id);
  }

  return (restaurants ?? []).map((r) => {
    const ownerId = ownerIdByRestaurant.get(r.id);
    const ownerUser = ownerId ? usersById.get(ownerId) : undefined;

    return {
      ...(r as Restaurant),
      reservationsThisMonth: reservationCounts.get(r.id) ?? 0,
      ownerEmail: ownerUser?.email ?? null,
      ownerLastSignInAt: ownerUser?.last_sign_in_at ?? null,
    };
  });
}

/** Détail d'un seul restaurant avec ses stats, pour la fiche /superadmin/{id}. */
export async function getRestaurantOverview(restaurantId: string): Promise<RestaurantOverview | null> {
  const supabase = createAdminClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .maybeSingle();
  if (!restaurant) return null;

  const [{ count }, { data: profile }] = await Promise.all([
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .gte("reservation_date", firstOfMonth()),
    supabase.from("profiles").select("id").eq("restaurant_id", restaurantId).eq("role", "owner").maybeSingle(),
  ]);

  let ownerEmail: string | null = null;
  let ownerLastSignInAt: string | null = null;

  if (profile?.id) {
    const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
    ownerEmail = userData.user?.email ?? null;
    ownerLastSignInAt = userData.user?.last_sign_in_at ?? null;
  }

  return {
    ...(restaurant as Restaurant),
    reservationsThisMonth: count ?? 0,
    ownerEmail,
    ownerLastSignInAt,
  };
}
