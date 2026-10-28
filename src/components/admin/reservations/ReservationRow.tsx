"use client";

import { useTransition } from "react";
import type { Reservation } from "@/types/database";
import {
  acceptReservation,
  refuseReservation,
  cancelReservationAdmin,
  markSeated,
  markNoShow,
} from "@/app/admin/actions/reservations";

const STATUS_LABELS: Record<Reservation["status"], { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmée", className: "bg-green-100 text-green-700" },
  refused: { label: "Refusée", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Annulée", className: "bg-neutral-200 text-neutral-500" },
  seated: { label: "Venu", className: "bg-blue-100 text-blue-700" },
  no_show: { label: "Absent", className: "bg-red-100 text-red-700" },
};

export function ReservationRow({ reservation }: { reservation: Reservation }) {
  const [isPending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<void>) {
    startTransition(() => action(reservation.id));
  }

  const status = STATUS_LABELS[reservation.status];

  return (
    <li className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-neutral-900">
            {reservation.reservation_time.slice(0, 5)} · {reservation.customer_name}
          </p>
          <p className="text-sm text-neutral-500">
            {reservation.party_size} pers.{reservation.source === "phone" ? " · ajoutée par tél." : ""}
          </p>
          {reservation.notes && <p className="mt-1 text-xs text-neutral-500">{reservation.notes}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={`tel:${reservation.customer_phone}`}
          className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
        >
          Appeler
        </a>

        {reservation.status === "pending" && (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(acceptReservation)}
              className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Accepter
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(refuseReservation)}
              className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Refuser
            </button>
          </>
        )}

        {reservation.status === "confirmed" && (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(markSeated)}
              className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Venu
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(markNoShow)}
              className="rounded-full bg-neutral-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Absent
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(cancelReservationAdmin)}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 disabled:opacity-50"
            >
              Annuler
            </button>
          </>
        )}
      </div>
    </li>
  );
}
