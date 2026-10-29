"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Printer, Trash2 } from "lucide-react";
import { deleteQuote, updateQuoteStatus } from "@/app/superadmin/actions/quotes";
import { QUOTE_STATUS_LABEL, type QuoteStatus } from "@/lib/quotes";

export function QuoteActions({ id, status }: { id: string; status: QuoteStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
      <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
        <Printer className="h-4 w-4" /> Imprimer / PDF
      </button>
      <label className="sr-only" htmlFor="quote-status">Statut</label>
      <select
        id="quote-status"
        value={status}
        disabled={pending}
        onChange={(e) =>
          startTransition(async () => {
            await updateQuoteStatus(id, e.target.value as QuoteStatus);
            router.refresh();
          })
        }
        className="min-h-11 rounded-full border border-slate-400 bg-white px-4 text-sm font-semibold text-slate-900"
      >
        {(Object.keys(QUOTE_STATUS_LABEL) as QuoteStatus[]).map((s) => (
          <option key={s} value={s}>{QUOTE_STATUS_LABEL[s]}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Supprimer ce devis ?")) return;
          startTransition(async () => {
            await deleteQuote(id);
            router.push("/superadmin/devis");
          });
        }}
        className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-rose-300 bg-white px-4 text-sm font-semibold text-rose-700 hover:bg-rose-50"
      >
        <Trash2 className="h-4 w-4" /> Supprimer
      </button>
    </div>
  );
}
