"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Armchair, CalendarClock, Info, Timer, Users2, Zap } from "lucide-react";
import {
  reservationSettingsSchema,
  type ReservationSettingsInput,
  type ReservationSettingsFormValues,
} from "@/lib/schemas";
import type { ReservationSettings } from "@/types/database";
import { updateReservationSettings } from "@/app/admin/actions/reservations";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";

function Section({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <Card className="space-y-5 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</span>
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-sm leading-6 text-slate-700">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

export function ReservationSettingsForm({ settings }: { settings: ReservationSettings }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReservationSettingsFormValues, unknown, ReservationSettingsInput>({
    resolver: zodResolver(reservationSettingsSchema),
    defaultValues: {
      slot_interval_minutes: settings.slot_interval_minutes,
      max_covers_per_slot: settings.max_covers_per_slot,
      total_seats: settings.total_seats,
      meal_duration_minutes: settings.meal_duration_minutes,
      last_booking_before_close_minutes: settings.last_booking_before_close_minutes,
      max_party_size_online: settings.max_party_size_online,
      min_advance_hours: settings.min_advance_hours,
      max_advance_days: settings.max_advance_days,
      auto_confirm: settings.auto_confirm,
    },
  });

  const seats = Number(watch("total_seats")) || 0;
  const duration = Number(watch("meal_duration_minutes")) || 90;
  const arrivals = Number(watch("max_covers_per_slot")) || 0;
  const turns = Math.max(1, Math.floor(180 / duration));

  function onSubmit(data: ReservationSettingsInput) {
    setSaved(false);
    startTransition(async () => {
      await updateReservationSettings(data);
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-3xl space-y-5">
      <Section
        icon={<Armchair className="h-5 w-5" />}
        title="Capacité du restaurant"
        description="Le nombre de places assises dont tu disposes. Le site refuse automatiquement toute réservation qui dépasserait ce nombre."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id="total-seats"
            label="Places assises au total"
            type="number"
            min={1}
            {...register("total_seats")}
            error={errors.total_seats?.message}
            hint="Ex : 40 = 40 couverts en même temps dans la salle."
          />
          <Input
            id="meal-duration"
            label="Durée moyenne d’un repas (minutes)"
            type="number"
            min={30}
            step={15}
            {...register("meal_duration_minutes")}
            error={errors.meal_duration_minutes?.message}
            hint="Une table réservée à 19h30 reste occupée 90 min avec 90."
          />
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-indigo-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Avec <strong>{seats} places</strong> et des repas de <strong>{duration} min</strong>, tu peux accueillir environ{" "}
            <strong>{seats * turns} couverts sur 3 heures</strong> de service.
          </p>
        </div>
        <Input
          id="reservation-capacity"
          label="Maximum de couverts qui arrivent en même temps"
          type="number"
          min={1}
          {...register("max_covers_per_slot")}
          error={errors.max_covers_per_slot?.message}
          hint={`Protège la cuisine d’un coup de feu : pas plus de ${arrivals || "…"} personnes qui arrivent sur le même créneau. Mets le même nombre que tes places si tu ne veux pas de limite.`}
        />
      </Section>

      <Section
        icon={<Timer className="h-5 w-5" />}
        title="Créneaux proposés"
        description="Les heures que le client voit dans le formulaire, calculées à partir de tes horaires d’ouverture."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Select id="reservation-interval" label="Un créneau toutes les" {...register("slot_interval_minutes")}>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
          </Select>
          <Input
            id="last-booking"
            label="Dernière réservation avant la fermeture (minutes)"
            type="number"
            min={0}
            step={15}
            {...register("last_booking_before_close_minutes")}
            hint="Ex : 30 = pour un service qui ferme à 22h30, dernière table à 22h00."
          />
        </div>
      </Section>

      <Section
        icon={<Users2 className="h-5 w-5" />}
        title="Règles pour tes clients"
        description="Jusqu’où et jusqu’à quand on peut réserver en ligne."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Input
            id="reservation-party-size"
            label="Groupe maximum en ligne"
            type="number"
            min={1}
            {...register("max_party_size_online")}
            hint="Au-delà, on invite le client à t’appeler."
          />
          <Input
            id="reservation-lead-time"
            label="Prévenir au moins (heures)"
            type="number"
            min={0}
            {...register("min_advance_hours")}
            hint="Ex : 2 = pas de réservation pour dans moins de 2 h."
          />
          <Input
            id="reservation-horizon"
            label="Réservable jusqu’à (jours)"
            type="number"
            min={1}
            {...register("max_advance_days")}
            hint="Ex : 60 = on peut réserver 2 mois à l’avance."
          />
        </div>
      </Section>

      <Section
        icon={<Zap className="h-5 w-5" />}
        title="Confirmation"
        description="Que se passe-t-il quand un client réserve en ligne ?"
      >
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-300 bg-slate-100 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Confirmer automatiquement</p>
            <p className="mt-1 max-w-lg text-xs leading-5 text-slate-700">
              Activé : la réservation est confirmée tout de suite et le client reçoit un email. Désactivé : tu valides chaque demande toi-même
              (Accepter / Refuser).
            </p>
          </div>
          <Toggle {...register("auto_confirm")} aria-label="Confirmer automatiquement les réservations" />
        </div>
      </Section>

      <div className="sticky bottom-24 z-20">
        <Button type="submit" variant="accent" size="lg" loading={isPending} icon={<CalendarClock className="h-4 w-4" />} className="w-full shadow-lg">
          {saved ? "Réglages enregistrés ✓" : "Enregistrer les réglages"}
        </Button>
      </div>
    </form>
  );
}
