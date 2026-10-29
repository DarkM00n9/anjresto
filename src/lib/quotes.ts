export interface QuoteLine {
  label: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface CompanySettings {
  legal_name: string;
  legal_form: string;
  share_capital: string | null;
  representative: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string;
  siret: string | null;
  rcs: string | null;
  vat_number: string | null;
  vat_rate: number;
  email: string | null;
  phone: string | null;
  iban: string | null;
  bic: string | null;
}

export type QuoteStatus = "draft" | "sent" | "signed" | "refused";

export interface Quote {
  id: string;
  number: string;
  quote_date: string;
  valid_until: string | null;
  restaurant_id: string | null;
  client_name: string;
  client_representative: string | null;
  client_address: string | null;
  client_email: string | null;
  client_phone: string | null;
  lines: QuoteLine[];
  deposit_percent: number;
  monthly_price: number;
  monthly_description: string | null;
  delivery_days: number;
  notes: string | null;
  status: QuoteStatus;
  public_token: string;
  sent_at: string | null;
  signature_data: string | null;
  signed_name: string | null;
  signed_at: string | null;
  signed_method: "in_person" | "remote" | null;
}

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  signed: "Signé",
  refused: "Refusé",
};

export const DEFAULT_LINES: QuoteLine[] = [
  {
    label: "Création du site du restaurant",
    description:
      "Site adapté au mobile (accueil, carte avec photos et allergènes, horaires, accès), réservation en ligne avec emails automatiques, espace d'administration, versions française et anglaise, mise en ligne et prise en main.",
    quantity: 1,
    unit_price: 1000,
  },
];

export const DEFAULT_MONTHLY_DESCRIPTION =
  "Hébergement et sécurité, emails de réservation, support, jusqu'à 3 modifications simples par mois (carte, horaires, photos). Sans engagement, préavis de 30 jours.";

const round = (n: number) => Math.round(n * 100) / 100;

export function computeTotals(quote: Pick<Quote, "lines" | "deposit_percent" | "monthly_price">, vatRate: number) {
  const ht = round(quote.lines.reduce((s, l) => s + l.quantity * l.unit_price, 0));
  const vat = round((ht * vatRate) / 100);
  const ttc = round(ht + vat);
  const deposit = round((ttc * quote.deposit_percent) / 100);
  const monthlyVat = round((quote.monthly_price * vatRate) / 100);
  return {
    ht,
    vat,
    ttc,
    deposit,
    balance: round(ttc - deposit),
    monthlyHt: round(quote.monthly_price),
    monthlyTtc: round(quote.monthly_price + monthlyVat),
  };
}

export function formatEUR(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export function formatDateFR(date: string | null) {
  return date ? date.split("-").reverse().join("/") : "";
}

export function formatDateTimeFR(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });
}
