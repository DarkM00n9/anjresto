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
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus } from "lucide-react";

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
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 py-4 text-sm font-semibold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
      >
        <Plus className="h-4 w-4" /> Ajouter une réservation téléphone
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900">Nouvelle réservation</h3>
          <p className="mt-1 text-sm text-slate-700">Réservation reçue par téléphone.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="manual-time" label="Heure" type="time" {...register("time")} />
          <Input id="manual-party-size" label="Nombre de personnes" type="number" min={1} {...register("party_size")} />
        </div>
        <Input id="manual-name" label="Nom" {...register("customer_name")} error={errors.customer_name?.message} />
        <Input id="manual-phone" label="Téléphone" type="tel" {...register("customer_phone")} error={errors.customer_phone?.message} />
        <Input id="manual-notes" label="Note (optionnel)" {...register("notes")} />
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" variant="accent" loading={isPending} className="sm:flex-1">Ajouter la réservation</Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
        </div>
      </Card>
    </form>
  );
}
