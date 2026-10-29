import { NextRequest, NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildPublicOrigin } from "@/lib/url";
import type { Restaurant } from "@/types/database";

const LOCAL_HOSTS = new Set(["localhost:3000", "127.0.0.1:3000"]);

/** "Se connecter en tant que" : journalise l'accès puis redirige vers /admin du resto. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  const profile = await requireSuperadmin();
  const { restaurantId } = await params;

  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant) {
    return NextResponse.redirect(new URL("/superadmin", request.url));
  }

  await admin.from("impersonation_logs").insert({ superadmin_id: profile.id, restaurant_id: restaurantId });

  const host = request.headers.get("host") ?? "";
  if (LOCAL_HOSTS.has(host)) {
    return NextResponse.redirect(new URL(`/r/${restaurant.slug}/admin`, request.url));
  }

  const baseUrl = buildPublicOrigin(restaurant as Restaurant, process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "");
  return NextResponse.redirect(`${baseUrl}/admin`);
}
