"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { duplicateRestaurant } from "@/app/superadmin/actions/restaurants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function DuplicateForm({ sourceId }: { sourceId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const res = await duplicateRestaurant(sourceId, slug, name);
      if (res.success && res.restaurantId) router.push(`/superadmin/${res.restaurantId}`);
      else setMessage(res.error ?? "Erreur.");
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Copy className="h-5 w-5" /></span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Utiliser comme modèle</p>
          <p className="text-xs text-slate-700">Copie le style, la carte, les horaires et les réglages dans un nouveau restaurant.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input id="dup-name" label="Nom du nouveau restaurant" value={name} onChange={(e) => setName(e.target.value)} />
        <Input id="dup-slug" label="Adresse (slug)" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="chez-paul" />
      </div>
      <Button type="button" variant="accent" onClick={submit} loading={pending} disabled={!name || !slug}>Dupliquer</Button>
      {message && <p role="alert" className="text-xs font-medium text-rose-700">{message}</p>}
    </Card>
  );
}
