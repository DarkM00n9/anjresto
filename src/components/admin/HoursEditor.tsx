"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OpeningHour } from "@/types/database";
import { updateOpeningHours } from "@/app/admin/actions/hours";
import type { DayScheduleInput } from "@/lib/schemas";

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function buildInitialDays(hours: OpeningHour[]): DayScheduleInput[] {
  return DAY_LABELS.map((_, day) => {
    const dayHours = hours.filter((h) => h.day_of_week === day && !h.is_closed && h.opens_at && h.closes_at);
    return {
      day_of_week: day,
      is_closed: dayHours.length === 0,
      slots: dayHours
        .map((h) => ({ opens_at: h.opens_at!.slice(0, 5), closes_at: h.closes_at!.slice(0, 5) }))
        .sort((a, b) => (a.opens_at < b.opens_at ? -1 : 1)),
    };
  });
}

export function HoursEditor({ hours }: { hours: OpeningHour[] }) {
  const router = useRouter();
  const [days, setDays] = useState<DayScheduleInput[]>(() => buildInitialDays(hours));
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggleClosed(day: number) {
    setDays((current) =>
      current.map((d) =>
        d.day_of_week === day
          ? { ...d, is_closed: !d.is_closed, slots: d.is_closed ? [{ opens_at: "12:00", closes_at: "14:00" }] : d.slots }
          : d,
      ),
    );
    setSaved(false);
  }

  function updateSlot(day: number, slotIndex: number, field: "opens_at" | "closes_at", value: string) {
    setDays((current) =>
      current.map((d) =>
        d.day_of_week === day
          ? { ...d, slots: d.slots.map((s, i) => (i === slotIndex ? { ...s, [field]: value } : s)) }
          : d,
      ),
    );
    setSaved(false);
  }

  function addSlot(day: number) {
    setDays((current) =>
      current.map((d) =>
        d.day_of_week === day && d.slots.length < 2
          ? { ...d, slots: [...d.slots, { opens_at: "19:00", closes_at: "22:00" }] }
          : d,
      ),
    );
    setSaved(false);
  }

  function removeSlot(day: number, slotIndex: number) {
    setDays((current) =>
      current.map((d) => (d.day_of_week === day ? { ...d, slots: d.slots.filter((_, i) => i !== slotIndex) } : d)),
    );
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await updateOpeningHours({ days });
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-6 sm:px-6">
      {days.map((day) => (
        <div key={day.day_of_week} className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-900">{DAY_LABELS[day.day_of_week]}</span>
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              Fermé
              <input
                type="checkbox"
                checked={day.is_closed}
                onChange={() => toggleClosed(day.day_of_week)}
                className="h-5 w-5 rounded"
              />
            </label>
          </div>

          {!day.is_closed && (
            <div className="mt-3 flex flex-col gap-2">
              {day.slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={slot.opens_at}
                    onChange={(e) => updateSlot(day.day_of_week, i, "opens_at", e.target.value)}
                    className="flex-1 rounded-lg border border-neutral-300 px-2 py-2 text-sm"
                  />
                  <span className="text-neutral-400">–</span>
                  <input
                    type="time"
                    value={slot.closes_at}
                    onChange={(e) => updateSlot(day.day_of_week, i, "closes_at", e.target.value)}
                    className="flex-1 rounded-lg border border-neutral-300 px-2 py-2 text-sm"
                  />
                  {day.slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(day.day_of_week, i)}
                      className="px-1 text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {day.slots.length < 2 && (
                <button
                  type="button"
                  onClick={() => addSlot(day.day_of_week)}
                  className="self-start text-xs font-medium text-neutral-500 underline"
                >
                  + Ajouter un service (midi/soir)
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="mt-2 w-full rounded-xl bg-neutral-900 px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Enregistrement..." : saved ? "Enregistré ✓" : "Enregistrer les horaires"}
      </button>
    </div>
  );
}
