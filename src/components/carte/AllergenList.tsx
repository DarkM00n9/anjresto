import type { Allergen } from "@/types/database";
import { ALLERGEN_LABELS, sortAllergens } from "@/lib/allergens";

export function AllergenList({ allergens }: { allergens: Allergen[] }) {
  if (allergens.length === 0) return null;

  return (
    <p className="mt-1 text-xs text-stone-600">
      Allergènes : {sortAllergens(allergens).map((a) => ALLERGEN_LABELS[a]).join(", ")}
    </p>
  );
}
