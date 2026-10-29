"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, CheckCircle2, Clock3, LoaderCircle, Users } from "lucide-react";
import { reservationFormSchema, type ReservationFormInput, type ReservationFormValues } from "@/lib/schemas";
import type { ReservationSettings } from "@/types/database";
import { getAvailableSlotsAction, createPublicReservation } from "@/app/actions/public-reservations";
import { getBookableDateRange, type AvailableSlot } from "@/lib/reservations/availability";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { WaitlistForm } from "./WaitlistForm";
import { buildCalendarLinks } from "@/lib/calendar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface ReservationFormProps {
  restaurantId: string;
  settings: ReservationSettings;
  restaurantPhone: string | null;
  restaurantName: string;
  restaurantAddress: string;
}

export function ReservationForm({ restaurantId, settings, restaurantPhone, restaurantName, restaurantAddress }: ReservationFormProps) {
  const { min, max } = getBookableDateRange(settings);
  const [slotResponse, setSlotResponse] = useState<{ key: string; slots: AvailableSlot[] } | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ status?: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
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

  const date = useWatch({ control, name: "date" });
  const partySize = Number(useWatch({ control, name: "party_size" }));
  const time = useWatch({ control, name: "time" });
  const partyTooLarge = partySize > settings.max_party_size_online;
  const slotRequestKey = `${date}:${partySize}`;
  const loadingSlots = Boolean(date && !partyTooLarge && slotResponse?.key !== slotRequestKey);
  const slots = !date || partyTooLarge || slotResponse?.key !== slotRequestKey ? [] : slotResponse.slots;

  useEffect(() => {
    if (!date || partyTooLarge) return;
    let active = true;
    getAvailableSlotsAction(restaurantId, date, partySize)
      .then((available) => {
        if (!active) return;
        setSlotResponse({ key: slotRequestKey, slots: available });
        setValue("time", "");
      })
      .catch(() => {
        if (active) setSlotResponse({ key: slotRequestKey, slots: [] });
      });
    return () => {
      active = false;
    };
  }, [restaurantId, date, partySize, partyTooLarge, slotRequestKey, setValue]);

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
    const calendar = buildCalendarLinks({
      title: `Réservation — ${restaurantName}`,
      date,
      time,
      durationMinutes: settings.meal_duration_minutes,
      location: restaurantAddress,
    });
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center sm:p-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <p className="mt-4 text-xl font-semibold text-emerald-900">
          {result.status === "confirmed" ? "Réservation confirmée !" : "Demande envoyée !"}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-emerald-800">
          {result.status === "confirmed"
            ? "Votre table est réservée. Vous recevrez un email de confirmation."
            : "Le restaurant va confirmer votre demande rapidement. Vous recevrez un email."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <a href={calendar.google} target="_blank" rel="noopener noreferrer" className="rounded-full border border-emerald-700 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100">
            Google Agenda
          </a>
          <a href={calendar.icsHref} download="reservation.ics" className="rounded-full border border-emerald-700 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100">
            Apple / Outlook (.ics)
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-6">
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

      <section>
        <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          <CalendarDays className="h-4 w-4 text-[var(--color-primary)]" /> Date et nombre de convives
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="reservation-date" label="Date" type="date" min={min} max={max} {...register("date")} />
          <Input id="reservation-party-size" label="Nombre de personnes" type="number" min={1} max={50} {...register("party_size")} />
        </div>
      </section>

      <section className="border-t border-stone-200 pt-5">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          <Clock3 className="h-4 w-4 text-[var(--color-primary)]" /> Choisissez votre horaire
        </div>
        {partyTooLarge ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Pour un groupe de plus de {settings.max_party_size_online} personnes, veuillez nous appeler directement
            {restaurantPhone ? ` au ${restaurantPhone}` : ""}.
          </p>
        ) : loadingSlots ? (
          <p className="flex items-center gap-2 py-2 text-sm text-stone-500"><LoaderCircle className="h-4 w-4 animate-spin" />Recherche des créneaux disponibles…</p>
        ) : slots.length === 0 ? (
          <>
            <p className="rounded-xl bg-stone-200 px-4 py-3 text-sm text-stone-700">Aucun créneau disponible ce jour-là. Essayez une autre date.</p>
            <WaitlistForm restaurantId={restaurantId} date={date} partySize={partySize} />
          </>
        ) : (
          <TimeSlotPicker slots={slots} value={time} onChange={(t) => setValue("time", t)} />
        )}
        {errors.time && <p role="alert" className="mt-2 text-xs font-medium text-red-600">Choisissez un horaire.</p>}
      </section>

      <section className="space-y-4 border-t border-stone-200 pt-5">
        <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          <Users className="h-4 w-4 text-[var(--color-primary)]" /> Vos coordonnées
        </div>
        <Input id="reservation-name" label="Nom complet" autoComplete="name" {...register("customer_name")} error={errors.customer_name?.message} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="reservation-phone" label="Téléphone" type="tel" autoComplete="tel" {...register("customer_phone")} error={errors.customer_phone?.message} />
          <Input id="reservation-email" label="E-mail (facultatif)" type="email" autoComplete="email" {...register("customer_email")} error={errors.customer_email?.message} />
        </div>
        <Textarea id="reservation-notes" label="Message (facultatif)" rows={3} {...register("notes")} placeholder="Allergies, occasion particulière…" />
      </section>

      <div className="border-t border-stone-200 pt-5">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-stone-600">
          <input type="checkbox" {...register("consent")} className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-[var(--color-primary)]" />
          <span>J’accepte que mes données soient utilisées pour traiter ma réservation.</span>
        </label>
        {errors.consent && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{errors.consent.message}</p>}
      </div>

      {serverError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

      <Button type="submit" variant="primary" size="lg" loading={isPending} disabled={isPending || partyTooLarge || !time} className="w-full">
        Envoyer ma demande
      </Button>
      <p className="text-center text-xs text-stone-600">Aucun paiement ne sera demandé en ligne.</p>
    </form>
  );
}
