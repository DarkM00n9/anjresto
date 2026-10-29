"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { quoteSignedEmail } from "@/lib/email/quote-email";
import { quoteLink } from "@/lib/quote-link";
import type { CompanySettings, Quote } from "@/lib/quotes";

const PNG = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/;

/** Signature d'un devis, par le client (sur place ou via le lien reçu). Le jeton secret du devis fait foi. */
export async function signQuote(input: { token: string; name: string; signature: string; method: "in_person" | "remote" }) {
  const name = input.name.trim().slice(0, 120);
  if (name.length < 2) return { success: false, error: "Indique ton nom." };
  if (!PNG.test(input.signature) || input.signature.length > 500_000) return { success: false, error: "Signature invalide, recommence." };
  if (!/^[a-f0-9]{64}$/.test(input.token)) return { success: false, error: "Devis introuvable." };

  const admin = createAdminClient();
  const { data } = await admin.from("quotes").select("*").eq("public_token", input.token).maybeSingle();
  if (!data) return { success: false, error: "Devis introuvable." };
  const quote = data as Quote;
  if (quote.status === "signed") return { success: false, error: "Ce devis est déjà signé." };
  if (quote.status === "refused") return { success: false, error: "Ce devis a été refusé." };
  if (quote.valid_until && quote.valid_until < new Date().toISOString().slice(0, 10)) return { success: false, error: "Ce devis a expiré." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
  const { data: updated, error } = await admin
    .from("quotes")
    .update({
      status: "signed",
      signature_data: input.signature,
      signed_name: name,
      signed_at: new Date().toISOString(),
      signed_method: input.method === "in_person" ? "in_person" : "remote",
      signed_ip: ip,
      signed_user_agent: (h.get("user-agent") ?? "").slice(0, 300),
    })
    .eq("id", quote.id)
    .neq("status", "signed")
    .select("id");
  if (error || !updated?.length) return { success: false, error: "Impossible d'enregistrer la signature." };

  // Confirmations par email (best-effort : la signature est déjà enregistrée).
  const { data: company } = await admin.from("company_settings").select("*").eq("id", 1).maybeSingle();
  if (company) {
    const link = await quoteLink(quote.public_token);
    const c = company as CompanySettings;
    if (quote.client_email) await sendEmail({ to: quote.client_email, ...quoteSignedEmail(quote, c, link, true) });
    if (c.email) await sendEmail({ to: c.email, ...quoteSignedEmail(quote, c, link, false) });
  }

  revalidatePath("/superadmin/devis");
  revalidatePath(`/superadmin/devis/${quote.id}`);
  revalidatePath(`/devis/${quote.public_token}`);
  return { success: true };
}
