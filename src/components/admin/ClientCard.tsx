"use client";

import { useState, useTransition } from "react";
import { Star, Phone } from "lucide-react";
import { saveCustomerNote } from "@/app/admin/actions/clients";

interface Props {
  name: string;
  phone: string;
  visits: number;
  noShows: number;
  lastVisit: string;
  note: string;
  isVip: boolean;
}

export function ClientCard({ name, phone, visits, noShows, lastVisit, note, isVip }: Props) {
  const [text, setText] = useState(note);
  const [vip, setVip] = useState(isVip);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(nextVip = vip) {
    startTransition(async () => {
      const res = await saveCustomerNote(phone, text, nextVip);
      setSaved(res.success);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{name}</p>
          <a href={`tel:${phone}`} className="mt-0.5 inline-flex items-center gap-1 text-sm text-indigo-700">
            <Phone className="h-3.5 w-3.5" /> {phone}
          </a>
        </div>
        <button
          type="button"
          aria-label="Client VIP"
          onClick={() => {
            setVip(!vip);
            save(!vip);
          }}
          className={`rounded-full border p-2 ${vip ? "border-amber-400 bg-amber-100 text-amber-700" : "border-slate-300 text-slate-500"}`}
        >
          <Star className="h-4 w-4" fill={vip ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="mt-2 text-xs font-medium text-slate-700">
        {visits} visite{visits > 1 ? "s" : ""} · dernière le {lastVisit.split("-").reverse().join("/")}
        {noShows > 0 && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-800">{noShows} no-show</span>}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => save()}
        rows={2}
        placeholder="Notes : allergie, table préférée, anniversaire…"
        className="mt-3 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm text-slate-900 placeholder:text-slate-500"
      />
      <p className="mt-1 h-4 text-xs text-emerald-700">{pending ? "Enregistrement…" : saved ? "Enregistré ✓" : ""}</p>
    </div>
  );
}
