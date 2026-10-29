"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OpeningHour } from "@/types/database";
import { updateOpeningHours } from "@/app/admin/actions/hours";
import type { DayScheduleInput } from "@/lib/schemas";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Plus, Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";

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
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
      {days.map((day) => (
        <Card key={day.day_of_week} className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-slate-900">{DAY_LABELS[day.day_of_week]}</span>
            <Toggle
              label="Fermé"
              checked={day.is_closed}
              onChange={() => toggleClosed(day.day_of_week)}
              className="flex-row-reverse gap-2 text-xs"
            />
          </div>

          {!day.is_closed && (
            <div className="mt-4 space-y-2.5">
              {day.slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-100 p-2">
                  <label className="sr-only" htmlFor={`hours-${day.day_of_week}-${i}-open`}>Ouverture, {DAY_LABELS[day.day_of_week]}</label>
                  <input
                    id={`hours-${day.day_of_week}-${i}-open`}
                    type="time"
                    value={slot.opens_at}
                    onChange={(e) => updateSlot(day.day_of_week, i, "opens_at", e.target.value)}
                    className="min-h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <span className="text-slate-700">à</span>
                  <label className="sr-only" htmlFor={`hours-${day.day_of_week}-${i}-close`}>Fermeture, {DAY_LABELS[day.day_of_week]}</label>
                  <input
                    id={`hours-${day.day_of_week}-${i}-close`}
                    type="time"
                    value={slot.closes_at}
                    onChange={(e) => updateSlot(day.day_of_week, i, "closes_at", e.target.value)}
                    className="min-h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                  {day.slots.length > 1 && (
                    <IconButton type="button" tone="danger" onClick={() => removeSlot(day.day_of_week, i)} aria-label={`Supprimer le service ${i + 1} du ${DAY_LABELS[day.day_of_week]}`}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  )}
                </div>
              ))}
              {day.slots.length < 2 && (
                <button
                  type="button"
                  onClick={() => addSlot(day.day_of_week)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter un service
                </button>
              )}
            </div>
          )}
        </Card>
      ))}
      </div>

      <Button type="button" variant="accent" size="lg" onClick={handleSave} loading={isPending} className="w-full">
        {saved ? "Horaires enregistrés" : "Enregistrer les horaires"}
      </Button>
    </div>
  );
}
