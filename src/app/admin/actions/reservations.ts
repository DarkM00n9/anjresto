"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { customerCancelledEmail, customerConfirmedEmail, customerRefusedEmail, serviceCancelledEmail } from "@/lib/email/templates";
import { notifyWaitlist } from "@/lib/waitlist";
import { buildPublicOrigin } from "@/lib/url";
import {
  manualReservationSchema,
  reservationSettingsSchema,
  closureSettingsSchema,
  type ManualReservationInput,
  type ReservationSettingsInput,
  type BlockedServiceInput,
} from "@/lib/schemas";
import { z } from "zod";
import { requireAdminContext } from "./guard";
import { ALL_ROLES } from "@/lib/permissions";
import type { Reservation, ReservationStatus } from "@/types/database";

async function updateStatusAndNotify(reservationId: string, newStatus: ReservationStatus) {
  const { restaurant } = await requireAdminContext(ALL_ROLES);
  const supabase = await createClient();

  const { data: reservation } = await supabase
    .from("reservations")
    .update({ status: newStatus })
    .eq("id", reservationId)
    .eq("restaurant_id", restaurant.id)
    .select()
    .single();

  if (reservation?.customer_email && (newStatus === "confirmed" || newStatus === "refused" || newStatus === "cancelled")) {
    const baseUrl = buildPublicOrigin(restaurant, process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "");
    const content =
      newStatus === "confirmed"
        ? customerConfirmedEmail(restaurant, reservation as Reservation, baseUrl)
        : newStatus === "refused"
          ? customerRefusedEmail(restaurant, reservation as Reservation)
          : customerCancelledEmail(restaurant, reservation as Reservation);
    await sendEmail({ to: reservation.customer_email, ...content });
  }

  if (reservation && (newStatus === "cancelled" || newStatus === "refused")) {
    await notifyWaitlist(restaurant, reservation.reservation_date);
  }

  revalidatePath("/admin/reservations");
}

/** Annule d'un coup toutes les réservations d'un service et prévient chaque client par e-mail. */
export async function cancelServiceReservations(date: string, opensAt: string, closesAt: string, message: string) {
  const { restaurant } = await requireAdminContext(ALL_ROLES);
  const supabase = await createClient();
  const { data } = await supabase
    .from("reservations")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("reservation_date", date)
    .gte("reservation_time", opensAt)
    .lte("reservation_time", closesAt)
    .in("status", ["pending", "confirmed"]);

  const list = (data ?? []) as Reservation[];
  if (list.length === 0) return { count: 0 };

  await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .in("id", list.map((r) => r.id));

  for (const r of list) {
    if (r.customer_email) {
      await sendEmail({ to: r.customer_email, ...serviceCancelledEmail(restaurant, r, message.slice(0, 500)) });
    }
  }
  revalidatePath("/admin/reservations");
  return { count: list.length };
}

export async function dismissWaitlistEntry(id: string) {
  const { restaurant } = await requireAdminContext(ALL_ROLES);
  const supabase = await createClient();
  await supabase.from("waitlist").update({ status: "done" }).eq("id", id).eq("restaurant_id", restaurant.id);
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
  const { restaurant } = await requireAdminContext(ALL_ROLES);
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
  const { restaurant } = await requireAdminContext(ALL_ROLES);
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

const updateReservationSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  party_size: z.coerce.number().int().min(1).max(200),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function updateReservationDetails(
  reservationId: string,
  input: { time: string; party_size: number; notes?: string },
) {
  const { restaurant } = await requireAdminContext(ALL_ROLES);
  const data = updateReservationSchema.parse(input);
  const supabase = await createClient();

  await supabase
    .from("reservations")
    .update({ reservation_time: data.time, party_size: data.party_size, notes: data.notes || null })
    .eq("id", reservationId)
    .eq("restaurant_id", restaurant.id);

  revalidatePath("/admin/reservations");
}

/** Correction d'une erreur : remet une réservation dans n'importe quel statut. */
export async function setReservationStatus(reservationId: string, status: ReservationStatus) {
  await updateStatusAndNotify(reservationId, status);
}
