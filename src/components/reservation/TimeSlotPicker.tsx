"use client";

import type { AvailableSlot } from "@/lib/reservations/availability";

interface TimeSlotPickerProps {
  slots: AvailableSlot[];
  value: string;
  onChange: (time: string) => void;
}

export function TimeSlotPicker({ slots, value, onChange }: TimeSlotPickerProps) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          onClick={() => onChange(slot.time)}
          aria-pressed={value === slot.time}
          className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/20 ${
            value === slot.time
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5"
          }`}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}
