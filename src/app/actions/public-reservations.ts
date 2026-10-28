"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { reservationFormSchema, type ReservationFormInput } from "@/lib/schemas";
import { computeAvailableSlots, defaultReservationSettings, type AvailableSlot } from "@/lib/reservations/availability";
import { buildPublicOrigin } from "@/lib/url";
import { sendEmail } from "@/lib/email/resend";
import {
  customerConfirmedEmail,
  customerPendingEmail,
  customerRefusedEmail,
  restaurantNewReservationEmail,
} from "@/lib/email/templates";
import type {
  BlockedService,
  Closure,
  OpeningHour,
  Reservation,
  ReservationSettings,
  Restaurant,
} from "@/types/database";

const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

async function loadAvailabilityContext(restaurantId: string, date: string) {
  const supabase = createAdminClient();

  const [{ data: settings }, { data: hours }, { data: closures }, { data: blocked }, { data: reservations }] =
    await Promise.all([
      supabase.from("reservation_settings").select("*").eq("restaurant_id", restaurantId).maybeSingle(),
      supabase.from("opening_hours").select("*").eq("restaurant_id", restaurantId),
      supabase.from("closures").select("*").eq("restaurant_id", restaurantId),
      supabase.from("blocked_services").select("*").eq("restaurant_id", restaurantId).eq("date", date),
      supabase
        .from("reservations")
        .select("reservation_time, party_size, status")
        .eq("restaurant_id", restaurantId)
        .eq("reservation_date", date),
    ]);

  return {
    settings: (settings as ReservationSettings | null) ?? defaultReservationSettings(restaurantId),
    hours: (hours ?? []) as OpeningHour[],
    closures: (closures ?? []) as Closure[],
    blockedServices: (blocked ?? []) as BlockedService[],
    existingReservations: (reservations ?? []) as Pick<Reservation, "reservation_time" | "party_size" | "status">[],
  };
}

export async function getAvailableSlotsAction(
  restaurantId: string,
  date: string,
  partySize: number,
): Promise<AvailableSlot[]> {
  const context = await loadAvailabilityContext(restaurantId, date);
  return computeAvailableSlots({ date, partySize, ...context });
}

interface CreateReservationResult {
  success: boolean;
  error?: string;
  status?: "pending" | "confirmed";
}

export async function createPublicReservation(
  restaurantId: string,
  input: ReservationFormInput,
  honeypot: string,
): Promise<CreateReservationResult> {
  // Honeypot : un bot remplit ce champ invisible. On fait semblant que ça a marché.
  if (honeypot) return { success: true, status: "pending" };

  const data = reservationFormSchema.parse(input);
  const supabase = createAdminClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .eq("is_published", true)
    .maybeSingle();
  if (!restaurant) return { success: false, error: "Restaurant introuvable." };

  const ip = await getClientIp();
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("reservation_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
    return { success: false, error: "Trop de tentatives. Réessaie dans quelques minutes." };
  }

  await supabase.from("reservation_rate_limits").insert({ ip, restaurant_id: restaurantId });

  // Revalidation de la disponibilité côté serveur — jamais confiance au client.
  const context = await loadAvailabilityContext(restaurantId, data.date);
  const slots = computeAvailableSlots({ date: data.date, partySize: data.party_size, ...context });

  if (!slots.some((s) => s.time === data.time)) {
    return { success: false, error: "Ce créneau n'est plus disponible. Merci de recharger la page." };
  }

  const status = context.settings.auto_confirm ? "confirmed" : "pending";

  const { data: reservation, error } = await supabase
    .from("reservations")
    .insert({
      restaurant_id: restaurantId,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email || null,
      party_size: data.party_size,
      reservation_date: data.date,
      reservation_time: data.time,
      status,
      notes: data.notes || null,
      consent: data.consent,
      source: "online",
    })
    .select()
    .single();

  if (error || !reservation) {
    return { success: false, error: "Une erreur est survenue. Réessaie." };
  }

  const baseUrl = buildPublicOrigin(restaurant as Restaurant, process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "");
  const typedReservation = reservation as Reservation;

  const emails: Promise<void>[] = [];
  if (data.customer_email) {
    const content = context.settings.auto_confirm
      ? customerConfirmedEmail(restaurant as Restaurant, typedReservation, baseUrl)
      : customerPendingEmail(restaurant as Restaurant, typedReservation, baseUrl);
    emails.push(sendEmail({ to: data.customer_email, ...content }));
  }
  if (restaurant.email) {
    const content = restaurantNewReservationEmail(
      restaurant as Restaurant,
      typedReservation,
      baseUrl,
      context.settings.auto_confirm,
    );
    emails.push(sendEmail({ to: restaurant.email, ...content }));
  }
  await Promise.all(emails);

  return { success: true, status };
}

export async function cancelReservationByToken(token: string) {
  const supabase = createAdminClient();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("*")
    .eq("cancellation_token", token)
    .maybeSingle();

  if (!reservation) return { success: false, error: "Réservation introuvable." };
  if (reservation.status === "cancelled") return { success: true, alreadyDone: true };

  await supabase.from("reservations").update({ status: "cancelled" }).eq("id", reservation.id);
  return { success: true };
}

export async function respondToReservationByToken(token: string, action: "accept" | "refuse") {
  const supabase = createAdminClient();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("*, restaurants(*)")
    .eq("action_token", token)
    .maybeSingle();

  if (!reservation) return { success: false, error: "Réservation introuvable." };

  if (reservation.status !== "pending") {
    return { success: true, alreadyDone: true, status: reservation.status as string };
  }

  const newStatus = action === "accept" ? "confirmed" : "refused";
  await supabase.from("reservations").update({ status: newStatus }).eq("id", reservation.id);

  const restaurant = reservation.restaurants as Restaurant;
  const baseUrl = buildPublicOrigin(restaurant, process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "");
  const updated = { ...reservation, status: newStatus } as Reservation;

  if (reservation.customer_email) {
    const content =
      action === "accept"
        ? customerConfirmedEmail(restaurant, updated, baseUrl)
        : customerRefusedEmail(restaurant, updated);
    await sendEmail({ to: reservation.customer_email, ...content });
  }

  return { success: true, status: newStatus };
}
