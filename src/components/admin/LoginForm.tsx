"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}${window.location.pathname.replace(/\/login$/, "/callback")}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <div className="mt-8 rounded-2xl bg-green-50 p-6 text-center">
        <p className="text-base font-semibold text-green-800">Lien envoyé !</p>
        <p className="mt-2 text-sm text-green-700">
          Ouvre l&apos;email reçu à {email} et appuie sur le lien pour te connecter.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <input
        type="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ton@email.fr"
        className="w-full rounded-xl border border-neutral-300 px-4 py-4 text-lg text-neutral-900"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-neutral-900 px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
      >
        {status === "sending" ? "Envoi..." : "Recevoir le lien de connexion"}
      </button>
      {status === "error" && (
        <p className="text-center text-sm text-red-600">
          Une erreur est survenue. Vérifie l&apos;adresse et réessaie.
        </p>
      )}
    </form>
  );
}
