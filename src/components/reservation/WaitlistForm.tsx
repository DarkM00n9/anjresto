"use client";

import { useState, useTransition } from "react";
import { BellRing, CheckCircle2 } from "lucide-react";
import { joinWaitlist } from "@/app/actions/public-reservations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useT } from "@/components/site/LangProvider";

interface Props {
  restaurantId: string;
  date: string;
  partySize: number;
}

/** Affichée quand un jour est complet : le client s'inscrit et reçoit un e-mail si une table se libère. */
export function WaitlistForm({ restaurantId, date, partySize }: Props) {
  const t = useT();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
        <CheckCircle2 className="h-5 w-5 shrink-0" /> {t("Vous êtes sur liste d'attente. Nous vous préviendrons si une table se libère.")}
      </p>
    );
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await joinWaitlist(restaurantId, { date, party_size: partySize, name, phone, email }, honeypot);
      if (res.success) setDone(true);
      else setError(res.error ?? "Une erreur est survenue.");
    });
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
        <BellRing className="h-4 w-4" /> {t("Complet ? Rejoignez la liste d'attente")}
      </p>
      <p className="text-xs text-amber-900">{t("Si une table se libère ce jour-là, vous recevez un e-mail pour réserver en premier.")}</p>
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />
      <Input id="wl-name" label={t("Nom")} value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input id="wl-phone" label={t("Téléphone")} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input id="wl-email" label={t("E-mail (pour être prévenu)")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-xs font-medium text-red-700">{error}</p>}
      <Button type="button" variant="primary" loading={pending} disabled={pending || !name || !phone || !email} onClick={submit}>
        {t("Me prévenir")}
      </Button>
    </div>
  );
}
