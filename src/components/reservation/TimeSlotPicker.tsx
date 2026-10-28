"use client";

import type { AvailableSlot } from "@/lib/reservations/availability";

interface TimeSlotPickerProps {
  slots: AvailableSlot[];
  value: string;
  onChange: (time: string) => void;
}

export function TimeSlotPicker({ slots, value, onChange }: TimeSlotPickerProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          onClick={() => onChange(slot.time)}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${
            value === slot.time
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
              : "border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}
