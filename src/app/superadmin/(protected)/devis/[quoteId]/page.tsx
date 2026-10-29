import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { QuoteDocument } from "@/components/superadmin/QuoteDocument";
import { QuoteActions } from "@/components/superadmin/QuoteActions";
import { QuoteSignPanel } from "@/components/superadmin/QuoteSignPanel";
import type { CompanySettings, Quote } from "@/lib/quotes";

export default async function QuotePage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  const admin = createAdminClient();
  const [{ data: quote }, { data: company }] = await Promise.all([
    admin.from("quotes").select("*").eq("id", quoteId).maybeSingle(),
    admin.from("company_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (!quote) notFound();
  const q = quote as Quote;
  const canSign = q.status !== "signed" && q.status !== "refused";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 print:max-w-none print:p-0">
      <Link href="/superadmin/devis" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-indigo-700 print:hidden">
        <ArrowLeft className="h-4 w-4" /> Devis
      </Link>
      <QuoteActions id={q.id} status={q.status} clientEmail={q.client_email} />
      {q.sent_at && q.status !== "signed" && (
        <p className="mb-3 text-xs text-slate-700 print:hidden">Envoyé par email le {new Date(q.sent_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" })}.</p>
      )}
      <QuoteDocument quote={q} company={(company ?? { legal_name: "NJ INVEST", legal_form: "SASU", city: "Marseille", vat_rate: 20 }) as CompanySettings} />
      {canSign && (
        <details className="mt-4 print:hidden">
          <summary className="inline-flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700">
            <PenLine className="h-4 w-4" /> Faire signer le client maintenant
          </summary>
          <div className="mt-3">
            <QuoteSignPanel token={q.public_token} defaultName={q.client_representative ?? ""} method="in_person" />
          </div>
        </details>
      )}
    </div>
  );
}
