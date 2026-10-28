import type { Reservation } from "@/types/database";
import { todayInParis } from "@/lib/closures";

export function DashboardReservations({ reservations }: { reservations: Reservation[] }) {
  const today = todayInParis();
  const todays = reservations.filter((r) => r.reservation_date === today);
  const tomorrows = reservations.filter((r) => r.reservation_date !== today);

  return (
    <div className="mt-6 space-y-6">
      <ReservationGroup title="Aujourd'hui" reservations={todays} />
      <ReservationGroup title="Demain" reservations={tomorrows} />
    </div>
  );
}

function ReservationGroup({ title, reservations }: { title: string; reservations: Reservation[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-700">{title}</h2>
      {reservations.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-400">Aucune réservation.</p>
      ) : (
        <ul className="mt-2 divide-y divide-neutral-200 overflow-hidden rounded-2xl bg-white shadow-sm">
          {reservations.map((r) => (
            <li key={r.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-neutral-900">{r.customer_name}</p>
                <p className="text-xs text-neutral-500">
                  {r.party_size} pers. · {r.reservation_time.slice(0, 5)}
                </p>
              </div>
              <a
                href={`tel:${r.customer_phone}`}
                className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700"
              >
                Appeler
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
