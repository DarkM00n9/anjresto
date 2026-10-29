"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { setLang } from "@/app/actions/lang";
import { useLang } from "./LangProvider";

/** Bouton discret : affiche la langue vers laquelle on bascule (EN quand le site est en français). */
export function LangSwitch() {
  const lang = useLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const target = lang === "fr" ? "en" : "fr";

  return (
    <button
      type="button"
      disabled={pending}
      lang={target}
      aria-label={target === "en" ? "Switch to English" : "Passer en français"}
      onClick={() =>
        startTransition(async () => {
          await setLang(target);
          router.refresh();
        })
      }
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900 disabled:opacity-50"
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      {target}
    </button>
  );
}
