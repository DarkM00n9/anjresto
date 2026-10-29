"use client";

import { useState, useTransition } from "react";
import { updateCustomDomain } from "@/app/superadmin/actions/restaurants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Globe2, Save } from "lucide-react";

export function CustomDomainForm({
  restaurantId,
  currentDomain,
}: {
  restaurantId: string;
  currentDomain: string | null;
}) {
  const [domain, setDomain] = useState(currentDomain ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateCustomDomain(restaurantId, { custom_domain: domain });
      if (!result.success) {
        setMessage(result.error ?? "Erreur lors de l'ajout du domaine sur Vercel.");
      } else if (result.skipped) {
        setMessage("Enregistré. Ajoute le domaine manuellement sur Vercel (VERCEL_TOKEN non configuré).");
      } else {
        setMessage("Enregistré et ajouté au projet Vercel.");
      }
    });
  }

  return (
    <Card className="mt-2 space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Globe2 className="h-5 w-5" /></span>
        <div><p className="text-sm font-semibold text-slate-900">Adresse du site</p><p className="mt-0.5 text-xs text-slate-700">Relie un domaine appartenant au restaurant.</p></div>
      </div>
      <Input id="custom-domain" label="Domaine personnalisé" type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="carte.monresto.fr" hint="Saisis le domaine sans https://" />
      <Button type="button" variant="accent" onClick={handleSave} loading={isPending} icon={<Save className="h-4 w-4" />}>Enregistrer le domaine</Button>
      {message && <p role="status" className="rounded-lg bg-slate-100 px-3 py-2 text-xs leading-5 text-slate-700">{message}</p>}

      <div className="rounded-xl border border-slate-300 bg-slate-100 p-4 text-xs leading-5 text-slate-700">
        <p className="font-semibold text-slate-800">Configuration DNS</p>
        <p className="mt-1.5">Sous-domaine, par exemple <code>carte.monresto.fr</code> : enregistrement <strong>CNAME</strong> vers <code>cname.vercel-dns.com</code>.</p>
        <p className="mt-1">Domaine racine, par exemple <code>monresto.fr</code> : enregistrement <strong>A</strong> vers <code>76.76.21.21</code>.</p>
      </div>
    </Card>
  );
}
