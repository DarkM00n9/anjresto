"use client";

import { useState, useTransition } from "react";
import { Languages } from "lucide-react";
import { translateAllContent } from "@/app/admin/actions/translate";
import { Button } from "@/components/ui/Button";

export function TranslateButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mb-5 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Languages className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Site en anglais</p>
          <p className="mt-0.5 text-xs text-slate-700">
            Ta carte, ta présentation et ton menu du jour sont traduits automatiquement à chaque enregistrement.
            Ce bouton traduit tout ce qui existe déjà.
          </p>
          <Button
            type="button"
            variant="accent"
            className="mt-3"
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                setMessage(null);
                const res = await translateAllContent();
                setMessage(res.success ? `${res.count} textes traduits en anglais.` : (res.error ?? "Erreur."));
              })
            }
          >
            Traduire tout mon site en anglais
          </Button>
          {message && <p role="status" className="mt-2 text-xs font-medium text-slate-800">{message}</p>}
        </div>
      </div>
    </div>
  );
}
