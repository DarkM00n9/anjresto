"use client";

import { ALLERGEN_VALUES } from "@/lib/schemas";
import { ALLERGEN_LABELS } from "@/lib/allergens";
import type { Allergen } from "@/types/database";

interface AllergenCheckboxGroupProps {
  value: Allergen[];
  onChange: (next: Allergen[]) => void;
}

export function AllergenCheckboxGroup({ value, onChange }: AllergenCheckboxGroupProps) {
  function toggle(allergen: Allergen) {
    onChange(value.includes(allergen) ? value.filter((a) => a !== allergen) : [...value, allergen]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALLERGEN_VALUES.map((allergen) => {
        const active = value.includes(allergen);
        return (
          <button
            key={allergen}
            type="button"
            onClick={() => toggle(allergen)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              active
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-600"
            }`}
          >
            {ALLERGEN_LABELS[allergen]}
          </button>
        );
      })}
    </div>
  );
}
