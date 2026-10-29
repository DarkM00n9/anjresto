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
            aria-pressed={active}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {ALLERGEN_LABELS[allergen]}
          </button>
        );
      })}
    </div>
  );
}
