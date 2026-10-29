"use client";

import { useState, type FormEvent } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-green-50 p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
        <p className="text-base font-semibold text-green-800">Lien envoyé !</p>
        <p className="text-sm text-green-700">
          Ouvre l&apos;email reçu à {email} et appuie sur le lien pour te connecter.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        type="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ton@email.fr"
        className="py-4 text-lg"
      />
      <Button type="submit" variant="accent" size="lg" loading={status === "sending"} icon={<Mail className="h-4 w-4" />}>
        {status === "sending" ? "Envoi..." : "Recevoir le lien de connexion"}
      </Button>
      {status === "error" && (
        <p className="text-center text-sm text-red-600">
          Une erreur est survenue. Vérifie l&apos;adresse et réessaie.
        </p>
      )}
    </form>
  );
}
