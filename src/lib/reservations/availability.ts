import type {
  BlockedService,
  Closure,
  OpeningHour,
  Reservation,
  ReservationSettings,
} from "@/types/database";
import { getActiveClosure } from "@/lib/closures";
import { addDays, minutesToHHMM, nowInParis, toMinutes, todayInParis } from "@/lib/datetime";

export interface AvailableSlot {
  time: string; // "HH:MM"
  remaining: number;
}

interface ComputeSlotsParams {
  date: string; // "YYYY-MM-DD"
  partySize: number;
  settings: ReservationSettings;
  hours: OpeningHour[];
  closures: Closure[];
  blockedServices: BlockedService[];
  existingReservations: Pick<Reservation, "reservation_time" | "party_size" | "status">[];
}

/** Bornes de dates réservables en ligne : [aujourd'hui, aujourd'hui + max_advance_days]. */
export function getBookableDateRange(settings: ReservationSettings) {
  return { min: todayInParis(), max: addDays(todayInParis(), settings.max_advance_days) };
}

/**
 * Calcule les créneaux disponibles pour une date et une taille de groupe données.
 * Utilisé à la fois pour l'affichage (formulaire public) et la revalidation
 * côté serveur au moment de la soumission — ne jamais faire confiance au client.
 */
export function computeAvailableSlots({
  date,
  partySize,
  settings,
  hours,
  closures,
  blockedServices,
  existingReservations,
}: ComputeSlotsParams): AvailableSlot[] {
  if (partySize <= 0 || partySize > settings.max_party_size_online) return [];

  const { min, max } = getBookableDateRange(settings);
  if (date < min || date > max) return [];

  if (getActiveClosure(closures)) return [];

  const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();
  const services = hours.filter(
    (h) => h.day_of_week === dayOfWeek && !h.is_closed && h.opens_at && h.closes_at,
  );
  if (services.length === 0) return [];

  const blockedForDate = blockedServices.filter((b) => b.date === date);
  const activeReservations = existingReservations.filter(
    (r) => r.status === "pending" || r.status === "confirmed",
  );

  const now = nowInParis();
  const isToday = date === todayInParis();
  const minMinutesFromNow = isToday ? now.getHours() * 60 + now.getMinutes() + settings.min_advance_hours * 60 : -1;

  const slots: AvailableSlot[] = [];

  for (const service of services) {
    const isBlocked = blockedForDate.some(
      (b) => b.opens_at.slice(0, 5) === service.opens_at!.slice(0, 5) && b.closes_at.slice(0, 5) === service.closes_at!.slice(0, 5),
    );
    if (isBlocked) continue;

    const opens = toMinutes(service.opens_at!);
    const closes = toMinutes(service.closes_at!);

    for (let t = opens; t + settings.slot_interval_minutes <= closes; t += settings.slot_interval_minutes) {
      if (isToday && t < minMinutesFromNow) continue;

      const time = minutesToHHMM(t);
      const booked = activeReservations
        .filter((r) => r.reservation_time.slice(0, 5) === time)
        .reduce((sum, r) => sum + r.party_size, 0);
      const remaining = settings.max_covers_per_slot - booked;

      if (remaining >= partySize) {
        slots.push({ time, remaining });
      }
    }
  }

  return slots.sort((a, b) => (a.time < b.time ? -1 : 1));
}

/** Les réglages par défaut si le restaurant n'a pas encore configuré ses réservations. */
export function defaultReservationSettings(restaurantId: string): ReservationSettings {
  return {
    restaurant_id: restaurantId,
    slot_interval_minutes: 30,
    max_covers_per_slot: 20,
    max_party_size_online: 8,
    min_advance_hours: 2,
    max_advance_days: 30,
    auto_confirm: true,
    updated_at: new Date().toISOString(),
  };
}
