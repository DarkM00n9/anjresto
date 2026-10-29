"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BlockedService, OpeningHour, Reservation, ReservationSettings, WaitlistEntry } from "@/types/database";
import { addDays } from "@/lib/datetime";
import { toggleBlockedService, cancelServiceReservations, dismissWaitlistEntry } from "@/app/admin/actions/reservations";
import { ReservationRow } from "./ReservationRow";
import { AddReservationForm } from "./AddReservationForm";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { ButtonLink } from "@/components/ui/Button";
import { AlertTriangle, BellRing, ArrowLeft, ArrowRight, CalendarDays, Clock, Search, Settings2, Users } from "lucide-react";

interface ReservationsDayViewProps {
  date: string;
  reservations: Reservation[];
  hours: OpeningHour[];
  blockedServices: BlockedService[];
  settings: ReservationSettings;
  waitlist: WaitlistEntry[];
}

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "À valider" },
  { key: "confirmed", label: "Confirmées" },
  { key: "done", label: "Terminées" },
  { key: "closed", label: "Annulées" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function matchesFilter(r: Reservation, f: FilterKey) {
  if (f === "all") return true;
  if (f === "pending") return r.status === "pending";
  if (f === "confirmed") return r.status === "confirmed";
  if (f === "done") return r.status === "seated" || r.status === "no_show";
  return r.status === "cancelled" || r.status === "refused";
}

function toMin(t: string) {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function ReservationsDayView({ date, reservations, hours, blockedServices, settings, waitlist }: ReservationsDayViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();
  const services = hours.filter((h) => h.day_of_week === dayOfWeek && !h.is_closed && h.opens_at && h.closes_at);
  const activeReservations = reservations.filter(
    (r) => r.status === "pending" || r.status === "confirmed" || r.status === "seated",
  );

  const pendingCount = reservations.filter((r) => r.status === "pending").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations.filter(
      (r) =>
        matchesFilter(r, filter) &&
        (!q ||
          r.customer_name.toLowerCase().includes(q) ||
          r.customer_phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))),
    );
  }, [reservations, filter, query]);

  const groups = useMemo(() => {
    const result = services.map((service) => {
      const opens = toMin(service.opens_at!);
      const closes = toMin(service.closes_at!);
      return {
        key: `${service.opens_at}-${service.closes_at}`,
        label: `${service.opens_at!.slice(0, 5)} – ${service.closes_at!.slice(0, 5)}`,
        items: filtered.filter((r) => toMin(r.reservation_time) >= opens && toMin(r.reservation_time) < closes),
      };
    });
    const grouped = new Set(result.flatMap((g) => g.items.map((r) => r.id)));
    const others = filtered.filter((r) => !grouped.has(r.id));
    if (others.length > 0) result.push({ key: "others", label: "Hors horaires", items: others });
    return result.length > 0 ? result : [{ key: "all", label: "Réservations", items: filtered }];
  }, [services, filtered]);

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

  function cancelService(opensAt: string, closesAt: string, count: number) {
    const message = window.prompt(
      `Annuler ${count} réservation(s) de ce service ? Chaque client avec un e-mail sera prévenu.\nMessage pour les clients (facultatif) :`,
      "",
    );
    if (message === null) return;
    startTransition(async () => {
      await cancelServiceReservations(date, opensAt, closesAt, message);
      await toggleBlockedService({ date, opens_at: opensAt, closes_at: closesAt }, true);
      router.refresh();
    });
  }

  return (
    <div>
      <AdminPageHeader
        title="Réservations"
        description="Suis les demandes, gère les services et ajoute les réservations prises par téléphone."
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin/reservations/calendrier" variant="outline-accent" icon={<CalendarDays className="h-4 w-4" />}>Calendrier</ButtonLink>
            <ButtonLink href="/admin/reservations/parametres" variant="outline-accent" icon={<Settings2 className="h-4 w-4" />}>Réglages</ButtonLink>
          </div>
        }
      />

      <AdminPanel className="mb-5 flex items-center justify-between gap-3 p-3 sm:p-4">
        <button type="button" onClick={() => goToDate(addDays(date, -1))} aria-label="Jour précédent" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-900 sm:text-base"><CalendarDays className="h-4 w-4 text-indigo-600" />{DAY_LABELS[dayOfWeek]}</p>
          <label className="sr-only" htmlFor="reservation-date">Choisir une date</label>
          <input id="reservation-date" type="date" value={date} onChange={(e) => goToDate(e.target.value)} className="mt-1 max-w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10" />
        </div>
        <button type="button" onClick={() => goToDate(addDays(date, 1))} aria-label="Jour suivant" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900">
          <ArrowRight className="h-4 w-4" />
        </button>
      </AdminPanel>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <AdminPanel className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Réservations</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{activeReservations.length}</p>
        </AdminPanel>
        <AdminPanel className="p-4 sm:p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700"><Users className="h-3.5 w-3.5" />Couverts</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{activeReservations.reduce((sum, reservation) => sum + reservation.party_size, 0)}</p>
        </AdminPanel>
        <AdminPanel className={`p-4 sm:p-5 ${pendingCount > 0 ? "border-amber-300 bg-amber-50" : ""}`}>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700"><Clock className="h-3.5 w-3.5" />À valider</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{pendingCount}</p>
        </AdminPanel>
      </div>

      {services.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Services</h2>
          <div className="grid gap-3 sm:grid-cols-2">
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
            // Pic d'occupation : places réellement occupées en même temps (durée d'un repas prise en compte).
            const serviceReservations = activeReservations.filter((r) => {
              const t = r.reservation_time.slice(0, 5);
              return t >= opensAt && t < closesAt;
            });
            const peak = Math.max(
              0,
              ...serviceReservations.map((point) => {
                const at = toMin(point.reservation_time);
                return serviceReservations
                  .filter((r) => toMin(r.reservation_time) <= at && at < toMin(r.reservation_time) + settings.meal_duration_minutes)
                  .reduce((sum, r) => sum + r.party_size, 0);
              }),
            );
            const capacity = settings.total_seats;
            const ratio = peak / capacity;
            const isBlocked = blockedServices.some(
              (b) => b.opens_at.slice(0, 5) === opensAt && b.closes_at.slice(0, 5) === closesAt,
            );

            return (
              <AdminPanel key={key} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {opensAt} – {closesAt}
                  </p>
                  <p className="mt-1 text-xs text-slate-700">
                    {peak} / {capacity} places au plus chargé · {covers} couverts réservés
                    {ratio >= 0.85 && !isBlocked && (
                      <span className="ml-2 inline-flex items-center gap-1 font-semibold text-amber-700"><AlertTriangle className="h-3 w-3" />Presque complet</span>
                    )}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full transition-all duration-700 ${ratio >= 0.85 ? "bg-rose-500" : ratio >= 0.6 ? "bg-amber-500" : "bg-indigo-600"}`} style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }} />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => toggleService(service, !isBlocked)}
                  className={`min-h-11 rounded-full px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    isBlocked ? "bg-rose-50 text-rose-700 hover:bg-rose-100" : "bg-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {isBlocked ? "Rouvrir" : "Marquer complet"}
                </button>
                {serviceReservations.length > 0 && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => cancelService(opensAt, closesAt, serviceReservations.length)}
                    className="min-h-11 rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                  >
                    Annuler le service
                  </button>
                )}
              </AdminPanel>
            );
          })}
          </div>
        </div>
      )}

      {waitlist.length > 0 && (
        <AdminPanel className="mb-6 border-amber-300 bg-amber-50 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900"><BellRing className="h-4 w-4" />Liste d&apos;attente ({waitlist.length})</h2>
          <ul className="space-y-2">
            {waitlist.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-3 text-sm text-slate-900">
                <span>
                  <strong>{w.customer_name}</strong> · {w.party_size} pers. · <a href={`tel:${w.customer_phone}`} className="text-indigo-700 underline">{w.customer_phone}</a>
                  {w.status === "notified" && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">prévenu</span>}
                </span>
                <button type="button" disabled={isPending} onClick={() => startTransition(async () => { await dismissWaitlistEntry(w.id); router.refresh(); })} className="rounded-full border border-slate-400 bg-white px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100">
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        </AdminPanel>
      )}

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Liste du jour <span className="ml-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">{filtered.length}</span></h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom ou téléphone" aria-label="Rechercher une réservation" className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 sm:w-64" />
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = reservations.filter((r) => matchesFilter(r, f.key)).length;
          return (
            <button key={f.key} type="button" onClick={() => setFilter(f.key)} aria-pressed={filter === f.key} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${filter === f.key ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}>
              {f.label} <span className={filter === f.key ? "text-indigo-100" : "text-slate-700"}>{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <AdminPanel className="py-9 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-slate-700" />
          <p className="mt-3 text-sm font-semibold text-slate-700">{reservations.length === 0 ? "Aucune réservation ce jour-là" : "Aucun résultat"}</p>
          <p className="mt-1 text-xs text-slate-700">{reservations.length === 0 ? "Les nouvelles réservations apparaîtront ici." : "Essaie un autre filtre ou une autre recherche."}</p>
        </AdminPanel>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.filter((g) => g.items.length > 0).map((group) => (
            <div key={group.key}>
              {groups.length > 1 && (
                <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700"><Clock className="h-3.5 w-3.5" />Service {group.label}</h3>
              )}
              <ul className="flex flex-col gap-3">
                {group.items.map((r) => <ReservationRow key={r.id} reservation={r} />)}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <AddReservationForm date={date} onCreated={() => router.refresh()} />
      </div>
    </div>
  );
}
