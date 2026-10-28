"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlockedService, OpeningHour, Reservation } from "@/types/database";
import { addDays } from "@/lib/datetime";
import { toggleBlockedService } from "@/app/admin/actions/reservations";
import { ReservationRow } from "./ReservationRow";
import { AddReservationForm } from "./AddReservationForm";

interface ReservationsDayViewProps {
  date: string;
  reservations: Reservation[];
  hours: OpeningHour[];
  blockedServices: BlockedService[];
}

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function ReservationsDayView({ date, reservations, hours, blockedServices }: ReservationsDayViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();
  const services = hours.filter((h) => h.day_of_week === dayOfWeek && !h.is_closed && h.opens_at && h.closes_at);
  const activeReservations = reservations.filter(
    (r) => r.status === "pending" || r.status === "confirmed" || r.status === "seated",
  );

  function goToDate(newDate: string) {
    router.push(`/admin/reservations?date=${newDate}`);
  }

  function toggleService(service: OpeningHour, block: boolean) {
    startTransition(async () => {
      await toggleBlockedService(
        { date, opens_at: service.opens_at!.slice(0, 5), closes_at: service.closes_at!.slice(0, 5) },
        block,
      );
      router.refresh();
    });
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Réservations</h1>
        <Link href="/admin/reservations/parametres" className="text-sm font-medium text-neutral-500">
          Réglages
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToDate(addDays(date, -1))}
          className="rounded-full bg-neutral-100 px-3 py-2 text-sm"
        >
          ←
        </button>
        <div className="text-center">
          <p className="font-semibold text-neutral-900">{DAY_LABELS[dayOfWeek]}</p>
          <input
            type="date"
            value={date}
            onChange={(e) => goToDate(e.target.value)}
            className="text-sm text-neutral-500"
          />
        </div>
        <button
          type="button"
          onClick={() => goToDate(addDays(date, 1))}
          className="rounded-full bg-neutral-100 px-3 py-2 text-sm"
        >
          →
        </button>
      </div>

      {services.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {services.map((service) => {
            const key = `${service.opens_at}-${service.closes_at}`;
            const opensAt = service.opens_at!.slice(0, 5);
            const closesAt = service.closes_at!.slice(0, 5);
            const covers = activeReservations
              .filter((r) => {
                const t = r.reservation_time.slice(0, 5);
                return t >= opensAt && t < closesAt;
              })
              .reduce((sum, r) => sum + r.party_size, 0);
            const isBlocked = blockedServices.some(
              (b) => b.opens_at.slice(0, 5) === opensAt && b.closes_at.slice(0, 5) === closesAt,
            );

            return (
              <div key={key} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {opensAt} – {closesAt}
                  </p>
                  <p className="text-xs text-neutral-500">{covers} couverts réservés</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => toggleService(service, !isBlocked)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                    isBlocked ? "bg-red-100 text-red-700" : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {isBlocked ? "Rouvrir" : "Marquer complet"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {reservations.length === 0 ? (
          <p className="text-sm text-neutral-400">Aucune réservation ce jour-là.</p>
        ) : (
          reservations.map((r) => <ReservationRow key={r.id} reservation={r} />)
        )}
      </ul>

      <div className="mt-6">
        <AddReservationForm date={date} onCreated={() => router.refresh()} />
      </div>
    </div>
  );
}
