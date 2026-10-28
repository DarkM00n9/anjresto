import type { Closure } from "@/types/database";

/** Date du jour (Europe/Paris) au format YYYY-MM-DD, comparable aux colonnes `date`. */
export function todayInParis(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
}

/** La fermeture exceptionnelle en cours aujourd'hui, s'il y en a une. */
export function getActiveClosure(closures: Closure[]): Closure | null {
  const today = todayInParis();
  return closures.find((c) => c.start_date <= today && today <= c.end_date) ?? null;
}
