const TIMEZONE = "Europe/Paris";

/** L'heure actuelle, comme si le serveur tournait en Europe/Paris. */
export function nowInParis(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
}

/** Date du jour (Europe/Paris) au format YYYY-MM-DD. */
export function todayInParis(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

export function toMinutes(time: string): number {
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Ajoute `days` jours à une date "YYYY-MM-DD" (calcul en UTC pour éviter les soucis de DST). */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
