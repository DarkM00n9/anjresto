import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addDays, todayInParis } from "@/lib/datetime";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/** Déclenché par Vercel Cron (vercel.json) : purge RGPD des réservations de plus de 12 mois. */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const cutoff = addDays(todayInParis(), -365);

  const { error, count } = await supabase
    .from("reservations")
    .delete({ count: "exact" })
    .lt("reservation_date", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: count ?? 0 });
}
