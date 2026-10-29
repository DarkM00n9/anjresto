import { Users, CalendarCheck, UserX, TrendingUp } from "lucide-react";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { listReservationsInRange } from "@/lib/get-reservations";
import { addDays, todayInParis } from "@/lib/datetime";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function Bar({ label, value, max, suffix }: { label: string; value: number; max: number; suffix: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-20 shrink-0 font-medium text-slate-800">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
      </div>
      <span className="w-20 shrink-0 text-right font-semibold text-slate-900">
        {value} {suffix}
      </span>
    </div>
  );
}

export default async function StatisticsPage() {
  const restaurant = await requireCurrentRestaurant();
  const today = todayInParis();
  const from = addDays(today, -89);
  const all = await listReservationsInRange(restaurant.id, from, today);

  const honored = all.filter((r) => r.status === "confirmed" || r.status === "seated" || r.status === "pending");
  const noShows = all.filter((r) => r.status === "no_show").length;
  const finished = all.filter((r) => r.status !== "cancelled" && r.status !== "refused" && r.status !== "pending");
  const noShowRate = finished.length ? Math.round((noShows / finished.length) * 100) : 0;
  const covers = honored.reduce((s, r) => s + r.party_size, 0);

  // Couverts par semaine (12 dernières semaines).
  const weeks: { label: string; covers: number }[] = [];
  for (let w = 11; w >= 0; w--) {
    const start = addDays(today, -w * 7 - 6);
    const end = addDays(today, -w * 7);
    const sum = honored
      .filter((r) => r.reservation_date >= start && r.reservation_date <= end)
      .reduce((s, r) => s + r.party_size, 0);
    weeks.push({ label: `${start.slice(8)}/${start.slice(5, 7)}`, covers: sum });
  }

  const byDay = DAYS.map((label, i) => ({
    label,
    covers: honored
      .filter((r) => new Date(`${r.reservation_date}T12:00:00Z`).getUTCDay() === i)
      .reduce((s, r) => s + r.party_size, 0),
  }));

  const hourMap = new Map<string, number>();
  for (const r of honored) {
    const h = `${r.reservation_time.slice(0, 2)}h`;
    hourMap.set(h, (hourMap.get(h) ?? 0) + r.party_size);
  }
  const byHour = [...hourMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, covers: value }));

  const kpis = [
    { label: "Couverts (90 j)", value: covers, icon: Users },
    { label: "Réservations", value: honored.length, icon: CalendarCheck },
    { label: "Taux de no-show", value: `${noShowRate}%`, icon: UserX },
    { label: "Moy. par résa", value: honored.length ? (covers / honored.length).toFixed(1) : "0", icon: TrendingUp },
  ];

  return (
    <AdminPage>
      <AdminPageHeader title="Statistiques" description="Les 90 derniers jours de ton restaurant." />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <AdminPanel key={k.label} className="p-4">
            <k.icon className="mb-2 h-5 w-5 text-indigo-600" />
            <p className="text-2xl font-bold text-slate-900">{k.value}</p>
            <p className="text-xs font-medium text-slate-700">{k.label}</p>
          </AdminPanel>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <AdminPanel className="space-y-2.5 p-4">
          <h2 className="font-semibold text-slate-900">Couverts par semaine</h2>
          {weeks.map((w) => (
            <Bar key={w.label} label={`Sem. ${w.label}`} value={w.covers} max={Math.max(...weeks.map((x) => x.covers))} suffix="couv." />
          ))}
        </AdminPanel>
        <div className="space-y-5">
          <AdminPanel className="space-y-2.5 p-4">
            <h2 className="font-semibold text-slate-900">Jours les plus chargés</h2>
            {byDay.map((d) => (
              <Bar key={d.label} label={d.label} value={d.covers} max={Math.max(...byDay.map((x) => x.covers))} suffix="couv." />
            ))}
          </AdminPanel>
          <AdminPanel className="space-y-2.5 p-4">
            <h2 className="font-semibold text-slate-900">Heures les plus chargées</h2>
            {byHour.length === 0 && <p className="text-sm text-slate-700">Pas encore de données.</p>}
            {byHour.map((h) => (
              <Bar key={h.label} label={h.label} value={h.covers} max={Math.max(...byHour.map((x) => x.covers))} suffix="couv." />
            ))}
          </AdminPanel>
        </div>
      </div>
    </AdminPage>
  );
}
