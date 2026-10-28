"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reservationSettingsSchema,
  type ReservationSettingsInput,
  type ReservationSettingsFormValues,
} from "@/lib/schemas";
import type { ReservationSettings } from "@/types/database";
import { updateReservationSettings } from "@/app/admin/actions/reservations";

export function ReservationSettingsForm({ settings }: { settings: ReservationSettings }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationSettingsFormValues, unknown, ReservationSettingsInput>({
    resolver: zodResolver(reservationSettingsSchema),
    defaultValues: {
      slot_interval_minutes: settings.slot_interval_minutes,
      max_covers_per_slot: settings.max_covers_per_slot,
      max_party_size_online: settings.max_party_size_online,
      min_advance_hours: settings.min_advance_hours,
      max_advance_days: settings.max_advance_days,
      auto_confirm: settings.auto_confirm,
    },
  });

  function onSubmit(data: ReservationSettingsInput) {
    setSaved(false);
    startTransition(async () => {
      await updateReservationSettings(data);
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-4 py-6 sm:px-6">
      <label className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
        <span className="text-sm font-medium text-neutral-700">Confirmation automatique</span>
        <input type="checkbox" {...register("auto_confirm")} className="h-6 w-6 rounded" />
      </label>
      <p className="-mt-3 text-xs text-neutral-500">
        Désactivée : chaque demande attend ta validation (bouton Accepter/Refuser, par email ou depuis
        la liste des réservations).
      </p>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Intervalle des créneaux</label>
        <select
          {...register("slot_interval_minutes")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Capacité max par créneau (couverts)</label>
        <input
          type="number"
          min={1}
          {...register("max_covers_per_slot")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        {errors.max_covers_per_slot && (
          <p className="mt-1 text-xs text-red-600">{errors.max_covers_per_slot.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Taille max d&apos;un groupe en ligne</label>
        <input
          type="number"
          min={1}
          {...register("max_party_size_online")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        <p className="mt-1 text-xs text-neutral-500">Au-delà : le client est invité à appeler directement.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Délai minimum avant réservation (heures)</label>
        <input
          type="number"
          min={0}
          {...register("min_advance_hours")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Réservable jusqu&apos;à (jours à l&apos;avance)
        </label>
        <input
          type="number"
          min={1}
          {...register("max_advance_days")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-neutral-900 px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Enregistrement..." : saved ? "Enregistré ✓" : "Enregistrer"}
      </button>
    </form>
  );
}
