"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  manualReservationSchema,
  type ManualReservationInput,
  type ManualReservationFormValues,
} from "@/lib/schemas";
import { createManualReservation } from "@/app/admin/actions/reservations";

export function AddReservationForm({ date, onCreated }: { date: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManualReservationFormValues, unknown, ManualReservationInput>({
    resolver: zodResolver(manualReservationSchema),
    defaultValues: { date, time: "19:00", party_size: 2, customer_name: "", customer_phone: "", notes: "" },
  });

  function onSubmit(data: ManualReservationInput) {
    startTransition(async () => {
      await createManualReservation(data);
      reset();
      setOpen(false);
      onCreated();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border-2 border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-500"
      >
        + Réservation (par téléphone)
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex gap-2">
        <input
          type="time"
          {...register("time")}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={1}
          {...register("party_size")}
          placeholder="Pers."
          className="w-20 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <input
        {...register("customer_name")}
        placeholder="Nom"
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      {errors.customer_name && <p className="text-xs text-red-600">{errors.customer_name.message}</p>}
      <input
        {...register("customer_phone")}
        placeholder="Téléphone"
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      {errors.customer_phone && <p className="text-xs text-red-600">{errors.customer_phone.message}</p>}
      <input
        {...register("notes")}
        placeholder="Note (optionnel)"
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Ajouter
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-600"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
