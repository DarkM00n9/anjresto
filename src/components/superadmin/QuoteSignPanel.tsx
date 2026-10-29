"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmSignature, requestSignatureCode } from "@/app/actions/quote-signing";

interface Props {
  token: string;
  defaultName?: string;
  defaultEmail?: string;
  method: "in_person" | "remote";
  /** true : le signataire doit saisir un code reçu par email ; false : il confirme son adresse email. */
  otpRequired: boolean;
}

const FIELD =
  "mt-1.5 min-h-12 w-full rounded-xl border border-slate-400 bg-white px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10";

export function QuoteSignPanel({ token, defaultName = "", defaultEmail = "", method, otpRequired }: Props) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const nameOk = name.trim().length >= 2;

  function sendCode() {
    setError(null);
    startTransition(async () => {
      const res = await requestSignatureCode({ token, name });
      if (res.success) setSentTo(res.maskedEmail);
      else setError(res.error);
    });
  }

  function sign() {
    setError(null);
    startTransition(async () => {
      const res = await confirmSignature({ token, name, email, code, method });
      if (res.success) router.refresh();
      else setError(res.error);
    });
  }

  const codeStep = otpRequired && sentTo !== null;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm print:hidden">
      <div>
        <p className="text-base font-bold text-slate-900">Signer le devis</p>
        <p className="mt-1 text-xs text-slate-700">Signature électronique : votre nom, la date et l&apos;empreinte du document sont enregistrés comme preuve.</p>
      </div>

      <div>
        <label htmlFor="sign-name" className="block text-sm font-semibold text-slate-700">Nom et prénom du signataire</label>
        <input id="sign-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" disabled={codeStep} className={FIELD} />
      </div>

      {!otpRequired && (
        <div>
          <label htmlFor="sign-email" className="block text-sm font-semibold text-slate-700">Confirmez votre adresse email</label>
          <input id="sign-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={FIELD} />
        </div>
      )}

      {nameOk && (
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Votre signature</p>
          <p className="mt-1 break-words text-3xl text-slate-900" style={{ fontFamily: '"Segoe Script","Snell Roundhand","Brush Script MT","Apple Chancery",cursive' }}>
            {name.trim()}
          </p>
        </div>
      )}

      {codeStep && (
        <div>
          <label htmlFor="sign-code" className="block text-sm font-semibold text-slate-700">Code reçu par email ({sentTo})</label>
          <input
            id="sign-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            className={`${FIELD} text-center text-2xl font-bold tracking-[0.4em]`}
          />
          <button type="button" onClick={sendCode} disabled={pending} className="mt-2 text-xs font-semibold text-slate-700 underline">Renvoyer un code</button>
        </div>
      )}

      <label className="flex items-start gap-3 text-sm text-slate-800">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />
        <span>J&apos;ai lu le devis ci-dessus et je l&apos;accepte. Bon pour accord.</span>
      </label>

      {otpRequired && !codeStep ? (
        <button type="button" onClick={sendCode} disabled={pending || !nameOk || !accepted} className="min-h-12 w-full rounded-full bg-indigo-600 px-6 text-base font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
          {pending ? "Envoi du code…" : "Recevoir mon code par email"}
        </button>
      ) : (
        <button
          type="button"
          onClick={sign}
          disabled={pending || !nameOk || !accepted || (otpRequired ? code.length !== 6 : email.trim().length < 5)}
          className="min-h-12 w-full rounded-full bg-indigo-600 px-6 text-base font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Signer le devis"}
        </button>
      )}
      {error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}
    </div>
  );
}
