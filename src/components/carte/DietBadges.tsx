import type { MenuItem } from "@/types/database";
import { Badge } from "@/components/ui/Badge";

const DIET_FLAGS: { key: keyof MenuItem; label: string; emoji: string }[] = [
  { key: "is_vegetarian", label: "Végétarien", emoji: "🌱" },
  { key: "is_vegan", label: "Végan", emoji: "🌿" },
  { key: "is_gluten_free", label: "Sans gluten", emoji: "🌾" },
  { key: "is_spicy", label: "Épicé", emoji: "🌶️" },
  { key: "is_homemade", label: "Fait maison", emoji: "🏠" },
];

export function DietBadges({ item }: { item: MenuItem }) {
  const active = DIET_FLAGS.filter((flag) => item[flag.key]);
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map((flag) => (
        <Badge key={flag.key} tone="primary">
          {flag.emoji} {flag.label}
        </Badge>
      ))}
    </div>
  );
}
