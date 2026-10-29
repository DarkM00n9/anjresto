"use client";

import type { Allergen } from "@/types/database";
import { useT } from "@/components/site/LangProvider";
import { ALLERGEN_LABELS, sortAllergens } from "@/lib/allergens";

export function AllergenList({ allergens }: { allergens: Allergen[] }) {
  const t = useT();
  if (allergens.length === 0) return null;


  return (
    <p className="mt-1 text-xs text-stone-600">
      {t("Allergènes")} : {sortAllergens(allergens).map((a) => t(ALLERGEN_LABELS[a])).join(", ")}
    </p>
  );
}
