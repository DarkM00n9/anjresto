"use client";

import { useState, useTransition } from "react";
import { Phone, Check, X, Undo2, UserRoundCheck, UserRoundX, MessageSquare, MessageCircle, Pencil, Mail } from "lucide-react";
import type { Reservation } from "@/types/database";
import {
  acceptReservation,
  refuseReservation,
  cancelReservationAdmin,
  markSeated,
  markNoShow,
  setReservationStatus,
  updateReservationDetails,
} from "@/app/admin/actions/reservations";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const STATUS_LABELS: Record<Reservation["status"], { label: string; tone: "warning" | "success" | "danger" | "muted" | "info" }> = {
  pending: { label: "En attente", tone: "warning" },
  confirmed: { label: "Confirmée", tone: "success" },
  refused: { label: "Refusée", tone: "danger" },
  cancelled: { label: "Annulée", tone: "muted" },
  seated: { label: "Installé", tone: "info" },
  no_show: { label: "Absent", tone: "danger" },
};

const chip =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200";
const field =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10";

export function ReservationRow({ reservation }: { reservation: Reservation }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState(reservation.reservation_time.slice(0, 5));
  const [partySize, setPartySize] = useState(String(reservation.party_size));
  const [notes, setNotes] = useState(reservation.notes ?? "");

  function run(action: (id: string) => Promise<void>) {
    startTransition(() => action(reservation.id));
  }

  function save() {
    startTransition(async () => {
      await updateReservationDetails(reservation.id, { time, party_size: Number(partySize) || 1, notes });
      setEditing(false);
    });
  }

  function cancel() {
    const warn = reservation.customer_email ? " Le client sera prévenu par email." : "";
    if (confirm(`Annuler la réservation de ${reservation.customer_name} ?${warn}`)) run(cancelReservationAdmin);
  }

  function changeStatus(next: Reservation["status"]) {
    if (next === reservation.status) return;
    const mails = reservation.customer_email && ["confirmed", "refused", "cancelled"].includes(next) ? " Le client sera prévenu par email." : "";
    if (confirm(`Passer cette réservation en « ${STATUS_LABELS[next].label} » ?${mails}`)) {
      startTransition(() => setReservationStatus(reservation.id, next));
    }
  }

  const status = STATUS_LABELS[reservation.status];
  const phone = reservation.customer_phone.replace(/[^\d+]/g, "");
  const waPhone = phone.startsWith("0") ? `33${phone.slice(1)}` : phone.replace("+", "");

  return (
    <li>
      <Card className={`p-4 sm:p-5 ${reservation.status === "pending" ? "border-amber-300 ring-1 ring-amber-200" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-900">
              <span className="mr-2 font-bold text-indigo-700">{reservation.reservation_time.slice(0, 5)}</span>
              {reservation.customer_name}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {reservation.party_size} {reservation.party_size === 1 ? "personne" : "personnes"}
              {reservation.source === "phone" ? " · ajoutée par téléphone" : ""}
              {reservation.customer_email && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-slate-700">
                  <Mail className="h-3 w-3" /> {reservation.customer_email}
                </span>
              )}
            </p>
            {!editing && reservation.notes && (
              <p className="mt-3 rounded-lg bg-slate-200 px-3 py-2 text-xs leading-5 text-slate-700">{reservation.notes}</p>
            )}
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>

        {editing && (
          <div className="mt-4 grid gap-3 rounded-xl bg-slate-100 p-3 sm:grid-cols-[auto_auto_1fr]">
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={field} aria-label="Heure" />
            <input type="number" min={1} value={partySize} onChange={(e) => setPartySize(e.target.value)} className={`${field} w-24`} aria-label="Couverts" />
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note interne" className={field} aria-label="Note" />
            <div className="flex gap-2 sm:col-span-3">
              <Button size="sm" variant="accent" loading={isPending} onClick={save}>Enregistrer</Button>
              <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Fermer</Button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
          <a href={`tel:${phone}`} className={chip}>
            <Phone className="h-3.5 w-3.5" /> Appeler
          </a>
          <a href={`sms:${phone}`} className={chip}>
            <MessageSquare className="h-3.5 w-3.5" /> SMS
          </a>
          <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className={chip}>
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
          <button type="button" onClick={() => setEditing((v) => !v)} className={chip}>
            <Pencil className="h-3.5 w-3.5" /> Modifier
          </button>
          {(reservation.status === "refused" || reservation.status === "cancelled" || reservation.status === "no_show" || reservation.status === "seated") && (
            <Button type="button" disabled={isPending} onClick={() => changeStatus("confirmed")} variant="outline-accent" size="sm" className="min-h-11">
              <Undo2 className="h-3.5 w-3.5" /> Rétablir
            </Button>
          )}

          {reservation.status === "pending" && (
            <>
              <Button type="button" disabled={isPending} onClick={() => run(acceptReservation)} variant="success" size="sm" className="min-h-11" loading={isPending}>
                <Check className="h-3.5 w-3.5" /> Accepter
              </Button>
              <Button type="button" disabled={isPending} onClick={() => run(refuseReservation)} variant="danger" size="sm" className="min-h-11">
                <X className="h-3.5 w-3.5" /> Refuser
              </Button>
            </>
          )}

          {reservation.status === "confirmed" && (
            <>
              <Button type="button" disabled={isPending} onClick={() => run(markSeated)} variant="accent" size="sm" className="min-h-11">
                <UserRoundCheck className="h-3.5 w-3.5" /> Installé
              </Button>
              <Button type="button" disabled={isPending} onClick={() => run(markNoShow)} variant="secondary" size="sm" className="min-h-11">
                <UserRoundX className="h-3.5 w-3.5" /> Absent
              </Button>
              <Button type="button" disabled={isPending} onClick={cancel} variant="outline-accent" size="sm" className="min-h-11">
                Annuler
              </Button>
            </>
          )}
          <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-700">
            Statut
            <select
              value={reservation.status}
              disabled={isPending}
              onChange={(e) => changeStatus(e.target.value as Reservation["status"])}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            >
              {Object.entries(STATUS_LABELS).map(([key, v]) => (
                <option key={key} value={key}>{v.label}</option>
              ))}
            </select>
          </label>
        </div>
      </Card>
    </li>
  );
}
