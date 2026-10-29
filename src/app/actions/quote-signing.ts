"use server";

import { headers } from "next/headers";
import { randomInt, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, sendEmailStrict } from "@/lib/email/resend";
import { quoteCodeEmail, quoteSignedEmail } from "@/lib/email/quote-email";
import { computeQuoteHash, hashOtp } from "@/lib/quote-hash";
import { quoteLink } from "@/lib/quote-link";
import { quoteOtpRequired } from "@/lib/quote-otp";
import type { CompanySettings, Quote } from "@/lib/quotes";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type Loaded = { quote: Quote; company: CompanySettings } | { error: string };

async function loadSignable(token: string): Promise<Loaded> {
  if (!/^[a-f0-9]{64}$/.test(token)) return { error: "Devis introuvable." };
  const admin = createAdminClient();
  const [{ data: quote }, { data: company }] = await Promise.all([
    admin.from("quotes").select("*").eq("public_token", token).maybeSingle(),
    admin.from("company_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (!quote || !company) return { error: "Devis introuvable." };
  const q = quote as Quote;
  if (q.status === "signed") return { error: "Ce devis est déjà signé." };
  if (q.status === "refused") return { error: "Ce devis n'est plus valable." };
  if (q.valid_until && q.valid_until < new Date().toISOString().slice(0, 10)) return { error: "Ce devis a expiré." };
  return { quote: q, company: company as CompanySettings };
}

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 1)}${"*".repeat(Math.max(2, user.length - 1))}@${domain}`;
}

/** Étape 1 : envoie un code à 6 chiffres à l'adresse email du client, pour vérifier son identité. */
export async function requestSignatureCode(input: { token: string; name: string }) {
  const name = input.name.trim();
  if (name.length < 2) return { success: false as const, error: "Indique ton nom et prénom." };
  if (!quoteOtpRequired()) return { success: false as const, error: "La vérification par code est désactivée." };
  const loaded = await loadSignable(input.token);
  if ("error" in loaded) return { success: false as const, error: loaded.error };
  const { quote, company } = loaded;
  if (!quote.client_email) return { success: false as const, error: "Aucun email client sur ce devis : ajoute-le avant de faire signer." };

  const admin = createAdminClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recent } = await admin.from("quote_otps").select("created_at").eq("quote_id", quote.id).gte("created_at", since).order("created_at", { ascending: false });
  if ((recent?.length ?? 0) >= 5) return { success: false as const, error: "Trop de codes demandés. Réessaie dans une heure." };
  if (recent?.[0] && Date.now() - new Date(recent[0].created_at as string).getTime() < 45_000) {
    return { success: false as const, error: "Un code vient d'être envoyé. Patiente quelques secondes avant d'en redemander un." };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const { error } = await admin.from("quote_otps").insert({
    quote_id: quote.id,
    email: quote.client_email,
    code_hash: hashOtp(code, quote.id),
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
  });
  if (error) return { success: false as const, error: "Impossible de générer le code (la migration 0018 est-elle exécutée ?)." };

  const mail = quoteCodeEmail(quote, company, code);
  const res = await sendEmailStrict({ to: quote.client_email, ...mail, replyTo: company.email ?? undefined });
  if (!res.ok) return { success: false as const, error: `Le code n'a pas pu être envoyé : ${res.error}` };
  return { success: true as const, maskedEmail: maskEmail(quote.client_email) };
}

/** Étape 2 : vérifie le code, fige le document (empreinte SHA-256) et enregistre la signature. */
export async function confirmSignature(input: { token: string; name: string; email: string; code: string; method: "in_person" | "remote" }) {
  const name = input.name.trim().slice(0, 120);
  const code = input.code.replace(/\s/g, "");
  const email = input.email.trim().toLowerCase();
  const otpRequired = quoteOtpRequired();
  if (name.length < 2) return { success: false as const, error: "Indique ton nom et prénom." };
  if (otpRequired && !/^\d{6}$/.test(code)) return { success: false as const, error: "Le code comporte 6 chiffres." };
  if (!otpRequired && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false as const, error: "Indique une adresse email valide." };
  const loaded = await loadSignable(input.token);
  if ("error" in loaded) return { success: false as const, error: loaded.error };
  const { quote, company } = loaded;

  const admin = createAdminClient();
  let verifiedEmail = email;
  if (otpRequired) {
    const { data: otp } = await admin
      .from("quote_otps")
      .select("*")
      .eq("quote_id", quote.id)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!otp) return { success: false as const, error: "Code expiré. Demande un nouveau code." };
    if ((otp.attempts as number) >= MAX_ATTEMPTS) return { success: false as const, error: "Trop d'essais. Demande un nouveau code." };

    await admin.from("quote_otps").update({ attempts: (otp.attempts as number) + 1 }).eq("id", otp.id);
    const expected = Buffer.from(otp.code_hash as string);
    const given = Buffer.from(hashOtp(code, quote.id));
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { success: false as const, error: "Code incorrect." };

    // Le code est à usage unique : on le consomme avant de signer.
    const { data: consumed } = await admin.from("quote_otps").update({ consumed_at: new Date().toISOString() }).eq("id", otp.id).is("consumed_at", null).select("id");
    if (!consumed?.length) return { success: false as const, error: "Code déjà utilisé. Demande un nouveau code." };
    verifiedEmail = otp.email as string;
  } else if (quote.client_email && quote.client_email.trim().toLowerCase() !== email) {
    return { success: false as const, error: "Cet email ne correspond pas à celui du devis." };
  }

  const h = await headers();
  const hash = computeQuoteHash(quote, company);
  const { data: updated, error } = await admin
    .from("quotes")
    .update({
      status: "signed",
      signed_name: name,
      signed_email: verifiedEmail,
      signed_verified: otpRequired,
      signed_at: new Date().toISOString(),
      signed_method: input.method === "in_person" ? "in_person" : "remote",
      signed_hash: hash,
      signed_ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || null,
      signed_user_agent: (h.get("user-agent") ?? "").slice(0, 300),
    })
    .eq("id", quote.id)
    .neq("status", "signed")
    .select("id");
  if (error || !updated?.length) return { success: false as const, error: "Impossible d'enregistrer la signature." };

  // Confirmations par email (best-effort : la signature est déjà enregistrée).
  const link = await quoteLink(quote.public_token);
  const signed = { ...quote, signed_name: name } as Quote;
  if (quote.client_email) await sendEmail({ to: quote.client_email, ...quoteSignedEmail(signed, company, link, true) });
  if (company.email) await sendEmail({ to: company.email, ...quoteSignedEmail(signed, company, link, false) });

  revalidatePath("/superadmin/devis");
  revalidatePath(`/superadmin/devis/${quote.id}`);
  revalidatePath(`/devis/${quote.public_token}`);
  return { success: true as const };
}
