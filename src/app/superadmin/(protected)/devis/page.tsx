import Link from "next/link";
import { FilePlus2, Building2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { ButtonLink } from "@/components/ui/Button";
import { QUOTE_STATUS_LABEL, computeTotals, formatDateFR, formatEUR, type Quote } from "@/lib/quotes";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-slate-100 text-slate-800",
  sent: "bg-indigo-100 text-indigo-800",
  signed: "bg-emerald-100 text-emerald-800",
  refused: "bg-rose-100 text-rose-800",
};

export default async function QuotesPage() {
  const admin = createAdminClient();
  const [{ data: quotes, error }, { data: company }] = await Promise.all([
    admin.from("quotes").select("*").order("created_at", { ascending: false }),
    admin.from("company_settings").select("vat_rate").eq("id", 1).maybeSingle(),
  ]);
  const vat = Number(company?.vat_rate ?? 20);
  const list = (quotes ?? []) as Quote[];

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Superadmin"
        title="Devis"
        description="Crée un devis pour un restaurant, imprime-le ou enregistre-le en PDF."
        backHref="/superadmin"
        backLabel="Restaurants"
        action={
          <div className="flex gap-2">
            <ButtonLink href="/superadmin/societe" variant="outline" icon={<Building2 className="h-4 w-4" />}>Ma société</ButtonLink>
            <ButtonLink href="/superadmin/devis/nouveau" variant="accent" icon={<FilePlus2 className="h-4 w-4" />}>Nouveau devis</ButtonLink>
          </div>
        }
      />
      {error && <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900">Table introuvable : exécute la migration 0016_quotes.sql dans Supabase.</p>}
      {list.length === 0 ? (
        <AdminPanel><p className="py-6 text-center text-sm text-slate-700">Aucun devis pour l&apos;instant.</p></AdminPanel>
      ) : (
        <ul className="space-y-2">
          {list.map((q) => (
            <li key={q.id}>
              <Link href={`/superadmin/devis/${q.id}`} className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm hover:bg-slate-50">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-900">{q.client_name}</span>
                  <span className="block text-xs text-slate-700">{q.number} · {formatDateFR(q.quote_date)}</span>
                </span>
                <span className="text-right text-sm font-bold text-slate-900">{formatEUR(computeTotals(q, vat).ttc)}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[q.status]}`}>{QUOTE_STATUS_LABEL[q.status]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminPage>
  );
}
