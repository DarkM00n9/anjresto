"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationFormSchema, type ReservationFormInput, type ReservationFormValues } from "@/lib/schemas";
import type { ReservationSettings } from "@/types/database";
import { getAvailableSlotsAction, createPublicReservation } from "@/app/actions/public-reservations";
import { getBookableDateRange, type AvailableSlot } from "@/lib/reservations/availability";
import { TimeSlotPicker } from "./TimeSlotPicker";

interface ReservationFormProps {
  restaurantId: string;
  settings: ReservationSettings;
  restaurantPhone: string | null;
}

export function ReservationForm({ restaurantId, settings, restaurantPhone }: ReservationFormProps) {
  const { min, max } = getBookableDateRange(settings);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ status?: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReservationFormValues, unknown, ReservationFormInput>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      date: min,
      time: "",
      party_size: 2,
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      notes: "",
      consent: false,
    },
  });

  const date = watch("date");
  const partySize = Number(watch("party_size"));
  const time = watch("time");
  const partyTooLarge = partySize > settings.max_party_size_online;

  useEffect(() => {
    if (!date || partyTooLarge) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    getAvailableSlotsAction(restaurantId, date, partySize)
      .then((available) => {
        setSlots(available);
        setValue("time", "");
      })
      .finally(() => setLoadingSlots(false));
  }, [restaurantId, date, partySize, partyTooLarge, setValue]);

  function onSubmit(data: ReservationFormInput) {
    setServerError(null);
    startTransition(async () => {
      const res = await createPublicReservation(restaurantId, data, honeypot);
      if (res.success) {
        setResult({ status: res.status });
      } else {
        setServerError(res.error ?? "Une erreur est survenue.");
      }
    });
  }

  if (result) {
    return (
      <div className="rounded-2xl bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">
          {result.status === "confirmed" ? "Réservation confirmée !" : "Demande envoyée !"}
        </p>
        <p className="mt-2 text-sm text-green-700">
          {result.status === "confirmed"
            ? "Vous recevrez un email de confirmation."
            : "Le restaurant va la confirmer rapidement. Vous recevrez un email."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative flex flex-col gap-5">
      {/* Honeypot anti-spam : invisible pour un humain, souvent rempli par un bot. */}
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />

      <div>
        <label className="block text-sm font-medium text-neutral-700">Date</label>
        <input
          type="date"
          min={min}
          max={max}
          {...register("date")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Nombre de personnes</label>
        <input
          type="number"
          min={1}
          max={50}
          {...register("party_size")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
      </div>

      {partyTooLarge ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Pour un groupe de plus de {settings.max_party_size_online} personnes, merci de nous appeler directement
          {restaurantPhone ? ` au ${restaurantPhone}` : ""}.
        </p>
      ) : (
        <div>
          <label className="block text-sm font-medium text-neutral-700">Heure</label>
          {loadingSlots ? (
            <p className="mt-2 text-sm text-neutral-400">Chargement des créneaux...</p>
          ) : slots.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-400">Aucun créneau disponible ce jour-là.</p>
          ) : (
            <TimeSlotPicker slots={slots} value={time} onChange={(t) => setValue("time", t)} />
          )}
          {errors.time && <p className="mt-1 text-xs text-red-600">Choisis un horaire.</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700">Nom</label>
        <input
          {...register("customer_name")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        {errors.customer_name && <p className="mt-1 text-xs text-red-600">{errors.customer_name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Téléphone</label>
        <input
          type="tel"
          {...register("customer_phone")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        {errors.customer_phone && <p className="mt-1 text-xs text-red-600">{errors.customer_phone.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Email (optionnel)</label>
        <input
          type="email"
          {...register("customer_email")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        {errors.customer_email && <p className="mt-1 text-xs text-red-600">{errors.customer_email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Message (optionnel)</label>
        <textarea
          rows={2}
          {...register("notes")}
          placeholder="Allergies, occasion spéciale..."
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-neutral-600">
        <input type="checkbox" {...register("consent")} className="mt-0.5 h-5 w-5 rounded" />
        J&apos;accepte que mes données soient utilisées pour traiter ma réservation.
      </label>
      {errors.consent && <p className="text-xs text-red-600">{errors.consent.message}</p>}

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isPending || partyTooLarge || !time}
        className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Envoi..." : "Réserver"}
      </button>
    </form>
  );
}
