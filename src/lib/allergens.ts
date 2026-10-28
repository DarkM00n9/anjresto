import type { Allergen } from "@/types/database";

/** Les 14 allergènes à déclaration obligatoire (réglementation INCO / UE 1169/2011). */
export const ALLERGEN_ORDER: Allergen[] = [
  "gluten",
  "crustaces",
  "oeufs",
  "poissons",
  "arachides",
  "soja",
  "lait",
  "fruits_a_coque",
  "celeri",
  "moutarde",
  "sesame",
  "sulfites",
  "lupin",
  "mollusques",
];

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: "Gluten",
  crustaces: "Crustacés",
  oeufs: "Œufs",
  poissons: "Poissons",
  arachides: "Arachides",
  soja: "Soja",
  lait: "Lait",
  fruits_a_coque: "Fruits à coque",
  celeri: "Céleri",
  moutarde: "Moutarde",
  sesame: "Sésame",
  sulfites: "Sulfites (SO2)",
  lupin: "Lupin",
  mollusques: "Mollusques",
};

export function sortAllergens(allergens: Allergen[]): Allergen[] {
  return [...allergens].sort(
    (a, b) => ALLERGEN_ORDER.indexOf(a) - ALLERGEN_ORDER.indexOf(b),
  );
}
