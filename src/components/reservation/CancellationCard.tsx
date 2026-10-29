"use client";

import { useState, useTransition } from "react";
import { cancelReservationByToken } from "@/app/actions/public-reservations";
import type { Reservation } from "@/types/database";
import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import { useLang, useT } from "@/components/site/LangProvider";

export function CancellationCard({ reservation }: { reservation: Reservation }) {
  const t = useT();
  const lang = useLang();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(reservation.status);
  const [error, setError] = useState<string | null>(null);

  const date = new Date(`${reservation.reservation_date}T12:00:00`).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handleCancel() {
    startTransition(async () => {
      const res = await cancelReservationByToken(reservation.cancellation_token);
      if (res.success) {
        setStatus("cancelled");
      } else {
        setError(res.error ?? t("Une erreur est survenue."));
      }
    });
  }

  if (status === "cancelled") {
    return (
      <div className="border border-stone-300 bg-white p-7 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-6 w-6" /></span>
        <p className="maison-title mt-4 text-2xl text-[var(--color-secondary)]">{t("Réservation annulée.")}</p>
        <p className="mt-2 text-sm text-stone-700">{t("Nous espérons vous accueillir une prochaine fois.")}</p>
      </div>
    );
  }

  return (
    <div className="border border-stone-300 bg-white p-5 sm:p-7">
      <dl className="divide-y divide-stone-200 text-sm">
        <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
          <dt className="inline-flex items-center gap-2 text-stone-600"><CalendarDays className="h-4 w-4" />{t("Date")}</dt>
          <dd className="text-right font-semibold capitalize text-stone-900">{date}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="inline-flex items-center gap-2 text-stone-600"><Clock3 className="h-4 w-4" />{t("Heure")}</dt>
          <dd className="font-semibold text-stone-900">{reservation.reservation_time.slice(0, 5)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
          <dt className="inline-flex items-center gap-2 text-stone-600"><Users className="h-4 w-4" />{t("Couverts")}</dt>
          <dd className="font-semibold text-stone-900">{reservation.party_size}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="maison-button mt-6 w-full !bg-red-700 disabled:opacity-60"
      >
        {isPending ? t("Annulation…") : t("Confirmer l’annulation")}
      </button>
      {error && <p role="alert" className="mt-3 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
