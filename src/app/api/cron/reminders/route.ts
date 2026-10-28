import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { customerReminderEmail } from "@/lib/email/templates";
import { buildPublicOrigin } from "@/lib/url";
import { addDays, todayInParis } from "@/lib/datetime";
import type { Reservation, Restaurant } from "@/types/database";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/** Déclenché par Vercel Cron (vercel.json) : rappel aux clients ayant une réservation demain. */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const tomorrow = addDays(todayInParis(), 1);

  const { data: rows } = await supabase
    .from("reservations")
    .select("*, restaurants(*)")
    .eq("reservation_date", tomorrow)
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .not("customer_email", "is", null);

  let sent = 0;

  for (const row of rows ?? []) {
    const restaurant = row.restaurants as Restaurant | null;
    const reservation = row as unknown as Reservation;
    if (!reservation.customer_email || !restaurant) continue;

    const baseUrl = buildPublicOrigin(restaurant, process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "");
    const content = customerReminderEmail(restaurant, reservation, baseUrl);
    await sendEmail({ to: reservation.customer_email, ...content });
    await supabase
      .from("reservations")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", reservation.id);
    sent++;
  }

  return NextResponse.json({ sent });
}
