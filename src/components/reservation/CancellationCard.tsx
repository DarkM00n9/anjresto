"use client";

import { useState, useTransition } from "react";
import { cancelReservationByToken } from "@/app/actions/public-reservations";
import type { Reservation } from "@/types/database";

export function CancellationCard({ reservation }: { reservation: Reservation }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(reservation.status);
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    startTransition(async () => {
      const res = await cancelReservationByToken(reservation.cancellation_token);
      if (res.success) {
        setStatus("cancelled");
      } else {
        setError(res.error ?? "Une erreur est survenue.");
      }
    });
  }

  if (status === "cancelled") {
    return (
      <div className="rounded-2xl bg-neutral-100 p-6 text-center">
        <p className="font-semibold text-neutral-800">Réservation annulée.</p>
        <p className="mt-2 text-sm text-neutral-500">À bientôt !</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <dl className="space-y-2 text-sm text-neutral-700">
        <div className="flex justify-between">
          <dt>Date</dt>
          <dd>{reservation.reservation_date}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Heure</dt>
          <dd>{reservation.reservation_time.slice(0, 5)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Couverts</dt>
          <dd>{reservation.party_size}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="mt-6 w-full rounded-xl border-2 border-red-300 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-50"
      >
        {isPending ? "Annulation..." : "Confirmer l'annulation"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
