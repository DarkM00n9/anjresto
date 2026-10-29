"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Closure } from "@/types/database";
import { createClosure, deleteClosure } from "@/app/admin/actions/hours";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Plus, Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";

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
    <div className="mt-8 border-t border-slate-300 pt-7">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">Fermetures exceptionnelles</h2>
      <p className="mt-1 text-sm text-slate-700">
        Vacances, jours fériés... affiché comme &quot;Fermé&quot; sur le site.
      </p>

      {closures.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {closures.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {c.start_date} → {c.end_date}
                </p>
                {c.message && <p className="mt-1 text-xs leading-5 text-slate-700">{c.message}</p>}
              </div>
              <IconButton type="button" tone="danger" onClick={() => handleDelete(c.id)} aria-label="Supprimer cette fermeture">
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <Card className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="closure-start" label="Du" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input id="closure-end" label="Au" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Textarea id="closure-message" label="Message affiché aux clients" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ex. Fermeture annuelle, réouverture le 15 août" rows={2} />
          <Button type="button" variant="accent" onClick={handleCreate} loading={isPending} disabled={!startDate || !endDate} icon={<Plus className="h-4 w-4" />}>Ajouter cette fermeture</Button>
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 py-4 text-sm font-semibold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
        >
          <Plus className="h-4 w-4" /> Ajouter une fermeture
        </button>
      )}
    </div>
  );
}
