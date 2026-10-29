"use client";

import { useState, useTransition } from "react";
import { Wallet } from "lucide-react";
import { updateBilling } from "@/app/superadmin/actions/restaurants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface Props {
  restaurantId: string;
  status: "trial" | "paid" | "unpaid";
  paidUntil: string | null;
  monthlyPrice: number;
}

export function BillingForm({ restaurantId, status, paidUntil, monthlyPrice }: Props) {
  const [state, setState] = useState(status);
  const [until, setUntil] = useState(paidUntil ?? "");
  const [price, setPrice] = useState(String(monthlyPrice));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await updateBilling(restaurantId, { subscription_status: state, paid_until: until, monthly_price: price });
      setMessage(res.success ? "Enregistré." : (res.error ?? "Erreur."));
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Wallet className="h-5 w-5" /></span>
        <p className="text-sm font-semibold text-slate-900">Abonnement</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {([["trial", "Essai"], ["paid", "À jour"], ["unpaid", "Impayé"]] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={state === key}
            onClick={() => setState(key)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              state === key
                ? key === "unpaid" ? "border-rose-600 bg-rose-600 text-white" : "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input id="billing-price" label="Prix mensuel (€)" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input id="billing-until" label="Payé jusqu'au" type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
      </div>
      <Button type="button" variant="accent" onClick={save} loading={pending}>Enregistrer</Button>
      {message && <p role="status" className="text-xs text-slate-700">{message}</p>}
    </Card>
  );
}
