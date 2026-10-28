"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Closure } from "@/types/database";
import { createClosure, deleteClosure } from "@/app/admin/actions/hours";

export function ClosuresManager({ closures }: { closures: Closure[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    if (!startDate || !endDate) return;
    startTransition(async () => {
      await createClosure({ start_date: startDate, end_date: endDate, message });
      setStartDate("");
      setEndDate("");
      setMessage("");
      setOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteClosure(id);
      router.refresh();
    });
  }

  return (
    <div className="px-4 pb-6 sm:px-6">
      <h2 className="text-sm font-semibold text-neutral-700">Fermetures exceptionnelles</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Vacances, jours fériés... affiché comme &quot;Fermé&quot; sur le site.
      </p>

      {closures.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {closures.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {c.start_date} → {c.end_date}
                </p>
                {c.message && <p className="text-xs text-neutral-500">{c.message}</p>}
              </div>
              <button type="button" onClick={() => handleDelete(c.id)} className="px-2 text-sm text-red-500">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 rounded-lg border border-neutral-300 px-2 py-2 text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 rounded-lg border border-neutral-300 px-2 py-2 text-sm"
            />
          </div>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message (ex : Fermeture annuelle, réouverture le 15 août)"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={isPending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-2xl border-2 border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-500"
        >
          + Fermeture exceptionnelle
        </button>
      )}
    </div>
  );
}
