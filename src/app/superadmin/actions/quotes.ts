"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmailStrict } from "@/lib/email/resend";
import { quoteEmail } from "@/lib/email/quote-email";
import { quoteLink } from "@/lib/quote-link";
import type { CompanySettings, Quote, QuoteLine, QuoteStatus } from "@/lib/quotes";

const text = (v: unknown, max = 500) => {
  const s = String(v ?? "").trim().slice(0, max);
  return s === "" ? null : s;
};
const num = (v: unknown) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const isoDate = (v: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "")) ? String(v) : null);

export interface CompanyInput {
  legal_name: string;
  legal_form: string;
  share_capital: string;
  representative: string;
  address_line: string;
  postal_code: string;
  city: string;
  siret: string;
  rcs: string;
  vat_number: string;
  vat_rate: string;
  email: string;
  phone: string;
  iban: string;
  bic: string;
}

export async function saveCompanySettings(input: CompanyInput) {
  await requireSuperadmin();
  const admin = createAdminClient();
  const { error } = await admin.from("company_settings").upsert({
    id: 1,
    legal_name: text(input.legal_name, 120) ?? "NJ INVEST",
    legal_form: text(input.legal_form, 20) ?? "SASU",
    share_capital: text(input.share_capital, 40),
    representative: text(input.representative, 120),
    address_line: text(input.address_line, 200),
    postal_code: text(input.postal_code, 12),
    city: text(input.city, 80) ?? "Marseille",
    siret: text(input.siret, 20),
    rcs: text(input.rcs, 80),
    vat_number: text(input.vat_number, 30),
    vat_rate: Math.min(100, Math.max(0, num(input.vat_rate))),
    email: text(input.email, 120),
    phone: text(input.phone, 30),
    iban: text(input.iban, 40),
    bic: text(input.bic, 15),
    updated_at: new Date().toISOString(),
  });
  if (error) return { success: false, error: "Impossible d'enregistrer (la migration 0016 est-elle exécutée ?)." };
  revalidatePath("/superadmin/societe");
  return { success: true };
}

export interface QuoteInput {
  restaurant_id: string;
  client_name: string;
  client_representative: string;
  client_address: string;
  client_email: string;
  client_phone: string;
  valid_until: string;
  lines: { label: string; description: string; quantity: string; unit_price: string }[];
  deposit_percent: string;
  monthly_price: string;
  monthly_description: string;
  delivery_days: string;
  notes: string;
}

export async function createQuote(input: QuoteInput) {
  await requireSuperadmin();
  const clientName = text(input.client_name, 160);
  const lines: QuoteLine[] = input.lines
    .map((l) => ({ label: String(l.label ?? "").trim().slice(0, 160), description: String(l.description ?? "").trim().slice(0, 800), quantity: Math.max(0, num(l.quantity)), unit_price: num(l.unit_price) }))
    .filter((l) => l.label);
  if (!clientName) return { success: false as const, error: "Indique le nom du client." };
  if (lines.length === 0) return { success: false as const, error: "Ajoute au moins une ligne." };

  const admin = createAdminClient();
  const year = new Date().getFullYear();
  const { count } = await admin.from("quotes").select("id", { count: "exact", head: true }).like("number", `DEV-${year}-%`);
  const number = `DEV-${year}-${String((count ?? 0) + 1).padStart(3, "0")}`;

  const { data, error } = await admin
    .from("quotes")
    .insert({
      number,
      restaurant_id: text(input.restaurant_id, 60),
      client_name: clientName,
      client_representative: text(input.client_representative, 120),
      client_address: text(input.client_address, 250),
      client_email: text(input.client_email, 120),
      client_phone: text(input.client_phone, 30),
      valid_until: isoDate(input.valid_until),
      lines,
      deposit_percent: Math.min(100, Math.max(0, num(input.deposit_percent))),
      monthly_price: Math.max(0, num(input.monthly_price)),
      monthly_description: text(input.monthly_description, 600),
      delivery_days: Math.max(1, Math.round(num(input.delivery_days)) || 5),
      notes: text(input.notes, 1000),
    })
    .select("id")
    .single();
  if (error || !data) return { success: false as const, error: "Impossible de créer le devis (la migration 0016 est-elle exécutée ?)." };
  revalidatePath("/superadmin/devis");
  return { success: true as const, id: data.id as string };
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  await requireSuperadmin();
  if (!["draft", "sent", "signed", "refused"].includes(status)) return { success: false };
  const { error } = await createAdminClient().from("quotes").update({ status }).eq("id", id);
  revalidatePath("/superadmin/devis");
  revalidatePath(`/superadmin/devis/${id}`);
  return { success: !error };
}

export async function deleteQuote(id: string) {
  await requireSuperadmin();
  const { error } = await createAdminClient().from("quotes").delete().eq("id", id);
  revalidatePath("/superadmin/devis");
  return { success: !error };
}

/** Envoie le devis par email avec un lien pour le consulter et le signer en ligne. */
export async function sendQuoteEmail(id: string) {
  await requireSuperadmin();
  const admin = createAdminClient();
  const [{ data: quote }, { data: company }] = await Promise.all([
    admin.from("quotes").select("*").eq("id", id).maybeSingle(),
    admin.from("company_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (!quote || !company) return { success: false, error: "Devis introuvable." };
  const q = quote as Quote;
  if (!q.client_email) return { success: false, error: "Ce devis n'a pas d'email client." };
  if (q.status === "signed") return { success: false, error: "Ce devis est déjà signé." };

  const link = await quoteLink(q.public_token);
  const mail = quoteEmail(q, company as CompanySettings, link);
  const res = await sendEmailStrict({ to: q.client_email, ...mail, replyTo: (company as CompanySettings).email ?? undefined });
  if (!res.ok) return { success: false, error: `Envoi impossible : ${res.error}` };

  await admin.from("quotes").update({ sent_at: new Date().toISOString(), status: q.status === "draft" ? "sent" : q.status }).eq("id", id);
  revalidatePath("/superadmin/devis");
  revalidatePath(`/superadmin/devis/${id}`);
  return { success: true };
}

export async function getQuoteLink(id: string) {
  await requireSuperadmin();
  const { data } = await createAdminClient().from("quotes").select("public_token").eq("id", id).maybeSingle();
  return data ? await quoteLink(data.public_token as string) : null;
}
