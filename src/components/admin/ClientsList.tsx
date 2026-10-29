"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronDown, MessageCircle, Phone, Search, Star } from "lucide-react";
import { saveCustomerNote } from "@/app/admin/actions/clients";

export interface ClientSummary {
  phone: string;
  name: string;
  email: string | null;
  visits: number;
  noShows: number;
  lastVisit: string;
  note: string;
  isVip: boolean;
  history: { date: string; time: string; partySize: number; status: string }[];
}

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "vip", label: "VIP" },
  { key: "regular", label: "Habitués" },
  { key: "noshow", label: "No-show" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const STATUS_LABEL: Record<string, string> = {
  pending: "À valider",
  confirmed: "Confirmée",
  seated: "Venu",
  no_show: "Absent",
};

function formatDate(date: string) {
  return date.split("-").reverse().join("/");
}

function ClientRow({ client }: { client: ClientSummary }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(client.note);
  const [vip, setVip] = useState(client.isVip);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [, startTransition] = useTransition();

  function save(nextVip = vip) {
    setStatus("saving");
    startTransition(async () => {
      const res = await saveCustomerNote(client.phone, note, nextVip);
      setStatus(res.success ? "saved" : "idle");
      setTimeout(() => setStatus("idle"), 1500);
    });
  }

  const whatsapp = `https://wa.me/${client.phone.replace(/[^\d]/g, "").replace(/^0/, "33")}`;

  return (
    <li className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-3 text-left hover:bg-slate-50 sm:p-4"
      >
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${vip ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"}`}>
          {vip ? <Star className="h-4 w-4" fill="currentColor" /> : client.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-slate-900">{client.name}</span>
          <span className="block truncate text-xs text-slate-700">
            {client.visits} visite{client.visits > 1 ? "s" : ""} · dernière le {formatDate(client.lastVisit)}
          </span>
        </span>
        {client.noShows > 0 && (
          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{client.noShows} absence{client.noShows > 1 ? "s" : ""}</span>
        )}
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-600 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${client.phone}`} className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100">
              <Phone className="h-3.5 w-3.5" /> {client.phone}
            </a>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <button
              type="button"
              aria-pressed={vip}
              onClick={() => {
                setVip(!vip);
                save(!vip);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold ${vip ? "border-amber-400 bg-amber-100 text-amber-900" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"}`}
            >
              <Star className="h-3.5 w-3.5" fill={vip ? "currentColor" : "none"} /> {vip ? "Client VIP" : "Marquer VIP"}
            </button>
          </div>

          <div>
            <label htmlFor={`note-${client.phone}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-700">Notes</label>
            <textarea
              id={`note-${client.phone}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => note !== client.note && save()}
              rows={2}
              placeholder="Allergie, table préférée, anniversaire…"
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm text-slate-900 placeholder:text-slate-600"
            />
            <p className="mt-1 h-4 text-xs text-emerald-700">{status === "saving" ? "Enregistrement…" : status === "saved" ? "Enregistré ✓" : ""}</p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-700">Dernières réservations</p>
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white text-sm">
              {client.history.map((h, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-slate-900">
                  <span>{formatDate(h.date)} · {h.time}</span>
                  <span className="text-xs text-slate-700">{h.partySize} pers. · {STATUS_LABEL[h.status] ?? h.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

export function ClientsList({ clients }: { clients: ClientSummary[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(
    () => ({
      all: clients.length,
      vip: clients.filter((c) => c.isVip).length,
      regular: clients.filter((c) => c.visits >= 3).length,
      noshow: clients.filter((c) => c.noShows > 0).length,
    }),
    [clients],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter === "vip" && !c.isVip) return false;
      if (filter === "regular" && c.visits < 3) return false;
      if (filter === "noshow" && c.noShows === 0) return false;
      return !q || c.name.toLowerCase().includes(q) || c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""));
    });
  }, [clients, query, filter]);

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un nom ou un téléphone"
            aria-label="Rechercher un client"
            className="w-full rounded-full border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${filter === f.key ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
            >
              {f.label} <span className={filter === f.key ? "text-indigo-100" : "text-slate-600"}>{counts[f.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-slate-300 bg-white py-10 text-center text-sm text-slate-700">
          {clients.length === 0 ? "Aucun client pour l'instant." : "Aucun client ne correspond."}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((c) => (
            <ClientRow key={c.phone} client={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
