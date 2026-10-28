import type { OpeningHour } from "@/types/database";
import { nowInParis, toMinutes } from "@/lib/datetime";

const DAY_LABELS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

/** Détermine si le restaurant est ouvert à l'instant présent (fuseau Europe/Paris). */
export function isOpenNow(hours: OpeningHour[]): boolean {
  const now = nowInParis();
  const day = now.getDay();
  const current = now.getHours() * 60 + now.getMinutes();

  return hours
    .filter((h) => h.day_of_week === day && !h.is_closed && h.opens_at && h.closes_at)
    .some((h) => {
      const opens = toMinutes(h.opens_at!);
      const closes = toMinutes(h.closes_at!);
      // Service traversant minuit (ex : 22h00 -> 00h30)
      if (closes <= opens) return current >= opens || current < closes;
      return current >= opens && current < closes;
    });
}

export interface DaySchedule {
  day: number;
  label: string;
  isToday: boolean;
  isClosed: boolean;
  slots: { opensAt: string; closesAt: string }[];
}

/** Regroupe les créneaux d'horaires par jour, triés et formatés pour l'affichage. */
export function groupHoursByDay(hours: OpeningHour[]): DaySchedule[] {
  const today = nowInParis().getDay();

  return DAY_LABELS.map((label, day) => {
    const dayHours = hours.filter((h) => h.day_of_week === day);
    const openSlots = dayHours
      .filter((h) => !h.is_closed && h.opens_at && h.closes_at)
      .sort((a, b) => (a.opens_at! < b.opens_at! ? -1 : 1));

    return {
      day,
      label,
      isToday: day === today,
      isClosed: openSlots.length === 0,
      slots: openSlots.map((h) => ({
        opensAt: formatTime(h.opens_at!),
        closesAt: formatTime(h.closes_at!),
      })),
    };
  });
}

export function formatTime(time: string): string {
  return time.slice(0, 5).replace(":", "h");
}
