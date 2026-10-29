"use client";

import { Flame, Home, Leaf, Sprout, Wheat, type LucideIcon } from "lucide-react";

type DietFlagKey = "is_vegetarian" | "is_vegan" | "is_gluten_free" | "is_spicy" | "is_homemade";

const FLAGS: { key: DietFlagKey; label: string; icon: LucideIcon }[] = [
  { key: "is_vegetarian", label: "Végétarien", icon: Leaf },
  { key: "is_vegan", label: "Végan", icon: Sprout },
  { key: "is_gluten_free", label: "Sans gluten", icon: Wheat },
  { key: "is_spicy", label: "Épicé", icon: Flame },
  { key: "is_homemade", label: "Fait maison", icon: Home },
];

interface BadgeCheckboxGroupProps {
  value: Record<DietFlagKey, boolean>;
  onChange: (key: DietFlagKey, next: boolean) => void;
}

export function BadgeCheckboxGroup({ value, onChange }: BadgeCheckboxGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FLAGS.map((flag) => {
        const active = value[flag.key];
        const Icon = flag.icon;
        return (
          <button
            key={flag.key}
            type="button"
            onClick={() => onChange(flag.key, !active)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {flag.label}
          </button>
        );
      })}
    </div>
  );
}
