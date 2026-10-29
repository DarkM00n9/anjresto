import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { QuoteDocument } from "@/components/superadmin/QuoteDocument";
import { QuoteActions } from "@/components/superadmin/QuoteActions";
import type { CompanySettings, Quote } from "@/lib/quotes";

export default async function QuotePage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  const admin = createAdminClient();
  const [{ data: quote }, { data: company }] = await Promise.all([
    admin.from("quotes").select("*").eq("id", quoteId).maybeSingle(),
    admin.from("company_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (!quote) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 print:max-w-none print:p-0">
      <Link href="/superadmin/devis" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-indigo-700 print:hidden">
        <ArrowLeft className="h-4 w-4" /> Devis
      </Link>
      <QuoteActions id={quote.id} status={quote.status} />
      <QuoteDocument quote={quote as Quote} company={(company ?? { legal_name: "NJ INVEST", legal_form: "SASU", city: "Marseille", vat_rate: 20 }) as CompanySettings} />
    </div>
  );
}
