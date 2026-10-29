"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLang } from "@/app/actions/lang";
import { useLang } from "./LangProvider";

export function LangSwitch() {
  const lang = useLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center rounded-full border border-black/15 text-[11px] font-semibold" role="group" aria-label="Langue / Language">
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          disabled={pending}
          aria-pressed={lang === l}
          onClick={() =>
            startTransition(async () => {
              await setLang(l);
              router.refresh();
            })
          }
          className={`px-2.5 py-1 uppercase transition-colors first:rounded-l-full last:rounded-r-full ${
            lang === l ? "bg-[var(--color-secondary)] text-white" : "text-stone-700 hover:bg-stone-200"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
