"use client";

import { useState, useTransition } from "react";
import { cancelReservationByToken } from "@/app/actions/public-reservations";
import type { Reservation } from "@/types/database";
import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function formatDate(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

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
      <div className="rounded-2xl border border-slate-300 bg-white p-7 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-6 w-6" /></span>
        <p className="mt-4 font-semibold text-slate-900">Réservation annulée.</p>
        <p className="mt-2 text-sm text-slate-700">Nous espérons vous accueillir une prochaine fois.</p>
      </div>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <dl className="space-y-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="inline-flex items-center gap-2 text-slate-700"><CalendarDays className="h-4 w-4" />Date</dt>
          <dd className="text-right font-semibold capitalize text-slate-900">{formatDate(reservation.reservation_date)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="inline-flex items-center gap-2 text-slate-700"><Clock3 className="h-4 w-4" />Heure</dt>
          <dd className="font-semibold text-slate-900">{reservation.reservation_time.slice(0, 5)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="inline-flex items-center gap-2 text-slate-700"><Users className="h-4 w-4" />Couverts</dt>
          <dd className="font-semibold text-slate-900">{reservation.party_size}</dd>
        </div>
      </dl>
      <Button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        variant="danger"
        size="lg"
        loading={isPending}
        className="mt-6 w-full"
      >
        Confirmer l’annulation
      </Button>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    </Card>
  );
}
