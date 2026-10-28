import type { Closure } from "@/types/database";
import { todayInParis } from "@/lib/datetime";

export { todayInParis };

/** La fermeture exceptionnelle en cours aujourd'hui, s'il y en a une. */
export function getActiveClosure(closures: Closure[]): Closure | null {
  const today = todayInParis();
  return closures.find((c) => c.start_date <= today && today <= c.end_date) ?? null;
}
