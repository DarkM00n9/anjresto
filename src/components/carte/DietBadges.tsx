"use client";

import type { MenuItem } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { useT } from "@/components/site/LangProvider";
import { Flame, Home, Leaf, Sprout, Wheat, type LucideIcon } from "lucide-react";

const DIET_FLAGS: { key: keyof MenuItem; label: string; icon: LucideIcon }[] = [
  { key: "is_vegetarian", label: "Végétarien", icon: Leaf },
  { key: "is_vegan", label: "Végan", icon: Sprout },
  { key: "is_gluten_free", label: "Sans gluten", icon: Wheat },
  { key: "is_spicy", label: "Épicé", icon: Flame },
  { key: "is_homemade", label: "Fait maison", icon: Home },
];

export function DietBadges({ item }: { item: MenuItem }) {
  const t = useT();
  const active = DIET_FLAGS.filter((flag) => item[flag.key]);
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map((flag) => (
        <Badge key={flag.key} tone="primary">
          <flag.icon className="h-3 w-3" aria-hidden="true" /> {t(flag.label)}
        </Badge>
      ))}
    </div>
  );
}
