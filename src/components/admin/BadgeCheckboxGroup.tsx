"use client";

type DietFlagKey = "is_vegetarian" | "is_vegan" | "is_gluten_free" | "is_spicy" | "is_homemade";

const FLAGS: { key: DietFlagKey; label: string; emoji: string }[] = [
  { key: "is_vegetarian", label: "Végétarien", emoji: "🌱" },
  { key: "is_vegan", label: "Végan", emoji: "🌿" },
  { key: "is_gluten_free", label: "Sans gluten", emoji: "🌾" },
  { key: "is_spicy", label: "Épicé", emoji: "🌶️" },
  { key: "is_homemade", label: "Fait maison", emoji: "🏠" },
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
        return (
          <button
            key={flag.key}
            type="button"
            onClick={() => onChange(flag.key, !active)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              active
                ? "border-[var(--color-primary,#C8553D)] bg-[var(--color-primary,#C8553D)]/10 text-[var(--color-primary,#C8553D)]"
                : "border-neutral-300 bg-white text-neutral-600"
            }`}
          >
            {flag.emoji} {flag.label}
          </button>
        );
      })}
    </div>
  );
}
