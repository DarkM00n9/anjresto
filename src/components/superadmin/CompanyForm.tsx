"use client";

import { useState, useTransition } from "react";
import { saveCompanySettings, type CompanyInput } from "@/app/superadmin/actions/quotes";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const FIELDS: { key: keyof CompanyInput; label: string; placeholder?: string; hint?: string }[] = [
  { key: "legal_name", label: "Nom de la société" },
  { key: "legal_form", label: "Forme juridique", placeholder: "SASU" },
  { key: "representative", label: "Représentant légal" },
  { key: "share_capital", label: "Capital social", placeholder: "1 000 €" },
  { key: "address_line", label: "Adresse" },
  { key: "postal_code", label: "Code postal" },
  { key: "city", label: "Ville" },
  { key: "siret", label: "SIRET" },
  { key: "rcs", label: "RCS", placeholder: "Marseille 994 860 229" },
  { key: "vat_number", label: "N° de TVA intracommunautaire" },
  { key: "vat_rate", label: "Taux de TVA (%)", hint: "20 si tu factures la TVA, 0 si non applicable (art. 293 B du CGI)." },
  { key: "email", label: "Email" },
  { key: "phone", label: "Téléphone" },
  { key: "iban", label: "IBAN", hint: "Affiché sur le devis pour le virement de l'acompte." },
  { key: "bic", label: "BIC" },
];

export function CompanyForm({ initial }: { initial: CompanyInput }) {
  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setMessage(null);
    startTransition(async () => {
      const res = await saveCompanySettings(values);
      setMessage(res.success ? "Enregistré." : (res.error ?? "Erreur."));
    });
  }

  return (
    <Card className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <Input
            key={f.key}
            id={`company-${f.key}`}
            label={f.label}
            placeholder={f.placeholder}
            hint={f.hint}
            value={values[f.key]}
            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
          />
        ))}
      </div>
      <Button type="button" onClick={save} loading={pending}>Enregistrer</Button>
      {message && <p role="status" className="text-xs font-medium text-slate-800">{message}</p>}
    </Card>
  );
}
