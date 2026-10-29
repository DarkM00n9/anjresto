import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { listReservationsInRange } from "@/lib/get-reservations";
import { addDays, todayInParis } from "@/lib/datetime";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export default async function ReservationsCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const restaurant = await requireCurrentRestaurant();
  const { month: monthParam } = await searchParams;
  const today = todayInParis();
  const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : today.slice(0, 7);

  const [year, monthNumber] = month.split("-").map(Number);
  const first = `${month}-01`;
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const last = `${month}-${String(daysInMonth).padStart(2, "0")}`;
  const offset = (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7; // lundi = 0

  const reservations = await listReservationsInRange(restaurant.id, first, last);
  const stats = new Map<string, { covers: number; count: number; pending: number }>();
  for (const r of reservations) {
    if (r.status === "cancelled" || r.status === "refused") continue;
    const s = stats.get(r.reservation_date) ?? { covers: 0, count: 0, pending: 0 };
    s.covers += r.party_size;
    s.count += 1;
    if (r.status === "pending") s.pending += 1;
    stats.set(r.reservation_date, s);
  }
  const maxCovers = Math.max(1, ...[...stats.values()].map((s) => s.covers));
  const totalCovers = [...stats.values()].reduce((sum, s) => sum + s.covers, 0);

  const cells: (string | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i)),
  ];

  const nav = "flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100";

  return (
    <AdminPage>
      <AdminPageHeader
        title="Calendrier"
        description="Vue d'ensemble des couverts par jour pour anticiper les gros services."
        backHref="/admin/reservations"
        backLabel="Vue du jour"
      />

      <AdminPanel className="mb-5 flex items-center justify-between gap-3 p-3 sm:p-4">
        <Link href={`/admin/reservations/calendrier?month=${shiftMonth(month, -1)}`} aria-label="Mois précédent" className={nav}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-center">
          <p className="flex items-center justify-center gap-2 text-base font-semibold text-slate-900">
            <CalendarDays className="h-4 w-4 text-indigo-600" />
            {MONTHS[monthNumber - 1]} {year}
          </p>
          <p className="mt-0.5 text-xs text-slate-700">{totalCovers} couverts ce mois-ci</p>
        </div>
        <Link href={`/admin/reservations/calendrier?month=${shiftMonth(month, 1)}`} aria-label="Mois suivant" className={nav}>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </AdminPanel>

      <AdminPanel className="p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {WEEKDAYS.map((d) => (
            <p key={d} className="pb-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-700">{d}</p>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;
            const s = stats.get(date);
            const ratio = s ? s.covers / maxCovers : 0;
            const isToday = date === today;
            return (
              <Link
                key={date}
                href={`/admin/reservations?date=${date}`}
                className={`relative flex min-h-16 flex-col justify-between rounded-xl border p-1.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-h-24 sm:p-2.5 ${
                  isToday ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-300"
                } ${s ? "bg-indigo-50" : "bg-white"}`}
                style={s ? { backgroundColor: `rgb(224 231 255 / ${0.35 + ratio * 0.65})` } : undefined}
              >
                <span className={`text-xs font-bold sm:text-sm ${isToday ? "text-indigo-700" : "text-slate-800"}`}>{Number(date.slice(8))}</span>
                {s && (
                  <span className="text-[11px] font-semibold leading-tight text-slate-800 sm:text-xs">
                    {s.covers}<span className="hidden font-normal text-slate-700 sm:inline"> couverts</span>
                  </span>
                )}
                {s && s.pending > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" title={`${s.pending} à valider`} />
                )}
              </Link>
            );
          })}
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-700">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Demandes à valider · plus la case est foncée, plus il y a de couverts
        </p>
      </AdminPanel>
    </AdminPage>
  );
}
