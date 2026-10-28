"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { customerConfirmedEmail, customerRefusedEmail } from "@/lib/email/templates";
import { buildPublicOrigin } from "@/lib/url";
import {
  manualReservationSchema,
  reservationSettingsSchema,
  closureSettingsSchema,
  type ManualReservationInput,
  type ReservationSettingsInput,
  type BlockedServiceInput,
} from "@/lib/schemas";
import { requireAdminContext } from "./guard";
import type { Reservation, ReservationStatus } from "@/types/database";

async function updateStatusAndNotify(reservationId: string, newStatus: ReservationStatus) {
  const { restaurant } = await requireAdminContext();
  const supabase = await createClient();

  const { data: reservation } = await supabase
    .from("reservations")
    .update({ status: newStatus })
    .eq("id", reservationId)
    .eq("restaurant_id", restaurant.id)
    .select()
    .single();

  if (reservation?.customer_email && (newStatus === "confirmed" || newStatus === "refused")) {
    const baseUrl = buildPublicOrigin(restaurant, process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "");
    const content =
      newStatus === "confirmed"
        ? customerConfirmedEmail(restaurant, reservation as Reservation, baseUrl)
        : customerRefusedEmail(restaurant, reservation as Reservation);
    await sendEmail({ to: reservation.customer_email, ...content });
  }

  revalidatePath("/admin/reservations");
}

export async function acceptReservation(reservationId: string) {
  await updateStatusAndNotify(reservationId, "confirmed");
}

export async function refuseReservation(reservationId: string) {
  await updateStatusAndNotify(reservationId, "refused");
}

export async function cancelReservationAdmin(reservationId: string) {
  await updateStatusAndNotify(reservationId, "cancelled");
}

export async function markSeated(reservationId: string) {
  await updateStatusAndNotify(reservationId, "seated");
}

export async function markNoShow(reservationId: string) {
  await updateStatusAndNotify(reservationId, "no_show");
}

export async function createManualReservation(input: ManualReservationInput) {
  const { restaurant } = await requireAdminContext();
  const data = manualReservationSchema.parse(input);
  const supabase = await createClient();

  await supabase.from("reservations").insert({
    restaurant_id: restaurant.id,
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: null,
    party_size: data.party_size,
    reservation_date: data.date,
    reservation_time: data.time,
    status: "confirmed",
    notes: data.notes || null,
    consent: true, // prise par téléphone, enregistrée directement par le resto
    source: "phone",
  });

  revalidatePath("/admin/reservations");
}

export async function updateReservationSettings(input: ReservationSettingsInput) {
  const { restaurant } = await requireAdminContext();
  const data = reservationSettingsSchema.parse(input);
  const supabase = await createClient();

  await supabase.from("reservation_settings").upsert({ restaurant_id: restaurant.id, ...data });

  revalidatePath("/admin/reservations");
  revalidatePath("/reservation");
}

export async function toggleBlockedService(input: BlockedServiceInput, block: boolean) {
  const { restaurant } = await requireAdminContext();
  const data = closureSettingsSchema.parse(input);
  const supabase = await createClient();

  if (block) {
    await supabase.from("blocked_services").insert({ restaurant_id: restaurant.id, ...data });
  } else {
    await supabase
      .from("blocked_services")
      .delete()
      .eq("restaurant_id", restaurant.id)
      .eq("date", data.date)
      .eq("opens_at", data.opens_at)
      .eq("closes_at", data.closes_at);
  }

  revalidatePath("/admin/reservations");
  revalidatePath("/reservation");
}
