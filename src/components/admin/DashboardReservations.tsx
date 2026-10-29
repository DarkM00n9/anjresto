import { Phone, CalendarX } from "lucide-react";
import type { Reservation } from "@/types/database";
import { todayInParis } from "@/lib/closures";
import { Card } from "@/components/ui/Card";

export function DashboardReservations({ reservations }: { reservations: Reservation[] }) {
  const today = todayInParis();
  const todays = reservations.filter((r) => r.reservation_date === today);
  const tomorrows = reservations.filter((r) => r.reservation_date !== today);

  return (
    <div className="mt-8 space-y-6">
      <ReservationGroup title="Aujourd'hui" reservations={todays} />
      <ReservationGroup title="Demain" reservations={tomorrows} />
    </div>
  );
}

function ReservationGroup({ title, reservations }: { title: string; reservations: Reservation[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {reservations.length === 0 ? (
        <Card className="mt-2 flex items-center gap-2 text-sm text-slate-700 shadow-none">
          <CalendarX className="h-4 w-4" />
          Aucune réservation.
        </Card>
      ) : (
        <ul className="mt-2 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          {reservations.map((r) => (
            <li key={r.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-neutral-900">{r.customer_name}</p>
                <p className="text-xs text-slate-700">
                  {r.party_size} pers. · {r.reservation_time.slice(0, 5)}
                </p>
              </div>
              <a
                href={`tel:${r.customer_phone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-slate-800 transition-colors hover:bg-neutral-200"
              >
                <Phone className="h-3.5 w-3.5" />
                Appeler
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
