"use client";

import { useState, useTransition } from "react";
import { LayoutTemplate } from "lucide-react";
import { updateLayoutStyle } from "@/app/superadmin/actions/restaurants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { LAYOUT_PRESETS } from "@/lib/layout-presets";

export function LayoutStyleForm({ restaurantId, current }: { restaurantId: string; current: string }) {
  const [style, setStyle] = useState(current);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><LayoutTemplate className="h-5 w-5" /></span>
        <p className="text-sm font-semibold text-slate-900">Style du site</p>
      </div>
      <Select id="layout-style" label="Mise en page" value={style} onChange={(e) => setStyle(e.target.value)}>
        {Object.entries(LAYOUT_PRESETS).map(([key, preset]) => (
          <option key={key} value={key}>{preset.label}</option>
        ))}
      </Select>
      <Button
        type="button"
        variant="accent"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await updateLayoutStyle(restaurantId, style);
            setMessage(res.success ? "Style appliqué au site." : (res.error ?? "Erreur."));
          })
        }
      >
        Appliquer
      </Button>
      {message && <p role="status" className="text-xs text-slate-700">{message}</p>}
    </Card>
  );
}
