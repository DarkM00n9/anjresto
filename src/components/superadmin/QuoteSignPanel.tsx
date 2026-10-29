"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signQuote } from "@/app/actions/quote-signing";
import { SignaturePad, type SignaturePadHandle } from "./SignaturePad";

export function QuoteSignPanel({ token, defaultName = "", method }: { token: string; defaultName?: string; method: "in_person" | "remote" }) {
  const router = useRouter();
  const pad = useRef<SignaturePadHandle>(null);
  const [name, setName] = useState(defaultName);
  const [accepted, setAccepted] = useState(false);
  const [empty, setEmpty] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await signQuote({ token, name, signature: pad.current!.toDataURL(), method });
      if (res.success) router.refresh();
      else setError(res.error ?? "Erreur.");
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm print:hidden">
      <p className="text-base font-bold text-slate-900">Signer le devis</p>
      <div>
        <label htmlFor="sign-name" className="block text-sm font-semibold text-slate-700">Nom et prénom du signataire</label>
        <input
          id="sign-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-400 bg-white px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
      <div>
        <p className="mb-1.5 text-sm font-semibold text-slate-700">Signature</p>
        <SignaturePad ref={pad} onChange={setEmpty} />
        <button type="button" onClick={() => pad.current?.clear()} className="mt-2 text-xs font-semibold text-slate-700 underline">Effacer et recommencer</button>
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-800">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />
        <span>J&apos;ai lu le devis ci-dessus et je l&apos;accepte. Bon pour accord.</span>
      </label>
      <button
        type="button"
        onClick={submit}
        disabled={pending || empty || !accepted || name.trim().length < 2}
        className="min-h-12 w-full rounded-full bg-indigo-600 px-6 text-base font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Signer le devis"}
      </button>
      {error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}
    </div>
  );
}
