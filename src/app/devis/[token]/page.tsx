import { notFound } from "next/navigation";
import { CheckCircle2, Printer } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { QuoteDocument } from "@/components/superadmin/QuoteDocument";
import { QuoteSignPanel } from "@/components/superadmin/QuoteSignPanel";
import { PrintButton } from "@/components/superadmin/PrintButton";
import type { CompanySettings, Quote } from "@/lib/quotes";

/** Page publique du devis, atteinte par le lien secret envoyé au client : consultation et signature. */
export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) notFound();
  const admin = createAdminClient();
  const [{ data: quote }, { data: company }] = await Promise.all([
    admin.from("quotes").select("*").eq("public_token", token).maybeSingle(),
    admin.from("company_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (!quote || !company) notFound();
  const q = quote as Quote;
  const expired = q.valid_until !== null && q.valid_until < new Date().toISOString().slice(0, 10);
  const canSign = q.status !== "signed" && q.status !== "refused" && !expired;

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 print:max-w-none print:px-0">
      {q.status === "signed" && (
        <p className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 print:hidden">
          <CheckCircle2 className="h-5 w-5 shrink-0" /> Devis signé. Merci pour votre confiance !
        </p>
      )}
      {q.status === "refused" && <p className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-900 print:hidden">Ce devis n&apos;est plus valable.</p>}
      {expired && q.status !== "signed" && <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900 print:hidden">Ce devis a expiré. Contactez-nous pour en obtenir un nouveau.</p>}
      <div className="flex justify-end print:hidden">
        <PrintButton label="Imprimer / enregistrer en PDF" icon={<Printer className="h-4 w-4" />} />
      </div>
      <QuoteDocument quote={q} company={company as CompanySettings} />
      {canSign && <QuoteSignPanel token={q.public_token} defaultName={q.client_representative ?? ""} method="remote" />}
    </div>
  );
}
