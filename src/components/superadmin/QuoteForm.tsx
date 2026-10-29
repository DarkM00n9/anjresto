"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createQuote } from "@/app/superadmin/actions/quotes";
import { DEFAULT_LINES, DEFAULT_MONTHLY_DESCRIPTION } from "@/lib/quotes";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface RestaurantOption {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
}

function inThirtyDays() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function QuoteForm({ restaurants }: { restaurants: RestaurantOption[] }) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState("");
  const [client, setClient] = useState({ name: "", representative: "", address: "", email: "", phone: "" });
  const [lines, setLines] = useState(DEFAULT_LINES.map((l) => ({ ...l, quantity: String(l.quantity), unit_price: String(l.unit_price) })));
  const [validUntil, setValidUntil] = useState(inThirtyDays);
  const [deposit, setDeposit] = useState("40");
  const [monthly, setMonthly] = useState("39");
  const [monthlyDesc, setMonthlyDesc] = useState(DEFAULT_MONTHLY_DESCRIPTION);
  const [delivery, setDelivery] = useState("5");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pickRestaurant(id: string) {
    setRestaurantId(id);
    const r = restaurants.find((x) => x.id === id);
    if (r) setClient({ ...client, name: r.name, address: r.address, email: r.email, phone: r.phone });
  }

  function updateLine(i: number, patch: Partial<(typeof lines)[number]>) {
    setLines(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createQuote({
        restaurant_id: restaurantId,
        client_name: client.name,
        client_representative: client.representative,
        client_address: client.address,
        client_email: client.email,
        client_phone: client.phone,
        valid_until: validUntil,
        lines: lines.map((l) => ({ ...l, quantity: String(l.quantity), unit_price: String(l.unit_price) })),
        deposit_percent: deposit,
        monthly_price: monthly,
        monthly_description: monthlyDesc,
        delivery_days: delivery,
        notes,
      });
      if (res.success) router.push(`/superadmin/devis/${res.id}`);
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <p className="text-sm font-semibold text-slate-900">Client</p>
        <Select id="q-restaurant" label="Restaurant existant (facultatif)" value={restaurantId} onChange={(e) => pickRestaurant(e.target.value)}>
          <option value="">— Nouveau client —</option>
          {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </Select>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input id="q-name" label="Nom du restaurant / société" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} />
          <Input id="q-rep" label="Représentant" value={client.representative} onChange={(e) => setClient({ ...client, representative: e.target.value })} />
          <Input id="q-address" label="Adresse" value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} />
          <Input id="q-email" label="Email" type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} />
          <Input id="q-phone" label="Téléphone" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} />
          <Input id="q-valid" label="Valable jusqu'au" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="text-sm font-semibold text-slate-900">Prestations (prix HT)</p>
        {lines.map((l, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-slate-300 p-3">
            <Input id={`l-label-${i}`} label="Désignation" value={l.label} onChange={(e) => updateLine(i, { label: e.target.value })} />
            <Textarea id={`l-desc-${i}`} label="Détail" value={l.description} onChange={(e) => updateLine(i, { description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input id={`l-qty-${i}`} label="Quantité" inputMode="decimal" value={l.quantity} onChange={(e) => updateLine(i, { quantity: e.target.value })} />
              <Input id={`l-price-${i}`} label="Prix unitaire HT (€)" inputMode="decimal" value={l.unit_price} onChange={(e) => updateLine(i, { unit_price: e.target.value })} />
            </div>
            {lines.length > 1 && (
              <button type="button" onClick={() => setLines(lines.filter((_, idx) => idx !== i))} className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                <Trash2 className="h-3.5 w-3.5" /> Retirer cette ligne
              </button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setLines([...lines, { label: "", description: "", quantity: "1", unit_price: "0" }])}>
          Ajouter une ligne
        </Button>
      </Card>

      <Card className="space-y-4">
        <p className="text-sm font-semibold text-slate-900">Paiement, abonnement et délai</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input id="q-deposit" label="Acompte (%)" inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
          <Input id="q-monthly" label="Abonnement HT / mois (€)" inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} hint="0 pour aucun abonnement." />
          <Input id="q-delivery" label="Livraison (jours ouvrés)" inputMode="numeric" value={delivery} onChange={(e) => setDelivery(e.target.value)} />
        </div>
        <Textarea id="q-monthly-desc" label="Ce que comprend l'abonnement" value={monthlyDesc} onChange={(e) => setMonthlyDesc(e.target.value)} />
        <Textarea id="q-notes" label="Remarques (facultatif)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Card>

      <Button type="button" onClick={submit} loading={pending} disabled={!client.name}>Créer le devis</Button>
      {error && <p role="alert" className="text-xs font-medium text-rose-700">{error}</p>}
    </div>
  );
}
