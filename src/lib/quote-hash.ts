import "server-only";
import { createHash, createHmac } from "node:crypto";
import type { CompanySettings, Quote } from "@/lib/quotes";

/** Contenu contractuel d'un devis : tout ce qui, modifié après signature, doit invalider l'empreinte. */
function canonical(quote: Quote, company: Pick<CompanySettings, "legal_name" | "legal_form" | "siret" | "vat_rate">) {
  return JSON.stringify({
    number: quote.number,
    quote_date: quote.quote_date,
    valid_until: quote.valid_until,
    client_name: quote.client_name,
    client_representative: quote.client_representative,
    client_address: quote.client_address,
    client_email: quote.client_email,
    lines: quote.lines,
    deposit_percent: Number(quote.deposit_percent),
    monthly_price: Number(quote.monthly_price),
    monthly_description: quote.monthly_description,
    delivery_days: quote.delivery_days,
    notes: quote.notes,
    vat_rate: Number(quote.vat_rate ?? company.vat_rate),
    company: [company.legal_name, company.legal_form, company.siret],
  });
}

export function computeQuoteHash(quote: Quote, company: CompanySettings) {
  return createHash("sha256").update(canonical(quote, company)).digest("hex");
}

/** Hash du code à usage unique, lié au devis (le code seul ne se déduit pas de la base). */
export function hashOtp(code: string, quoteId: string) {
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").update(`${quoteId}:${code}`).digest("hex");
}
