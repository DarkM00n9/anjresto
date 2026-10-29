import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";
import { CompanyForm } from "@/components/superadmin/CompanyForm";
import type { CompanyInput } from "@/app/superadmin/actions/quotes";

export default async function CompanyPage() {
  const { data } = await createAdminClient().from("company_settings").select("*").eq("id", 1).maybeSingle();
  const s = (v: unknown) => (v == null ? "" : String(v));
  const initial: CompanyInput = {
    legal_name: s(data?.legal_name ?? "NJ INVEST"),
    legal_form: s(data?.legal_form ?? "SASU"),
    share_capital: s(data?.share_capital),
    representative: s(data?.representative ?? "Noam Jaoui"),
    address_line: s(data?.address_line ?? "6 rue Barthet"),
    postal_code: s(data?.postal_code ?? "13010"),
    city: s(data?.city ?? "Marseille"),
    siret: s(data?.siret ?? "99486022900016"),
    rcs: s(data?.rcs ?? "Marseille 994 860 229"),
    vat_number: s(data?.vat_number ?? "FR18994860229"),
    vat_rate: s(data?.vat_rate ?? 20),
    email: s(data?.email),
    phone: s(data?.phone),
    iban: s(data?.iban),
    bic: s(data?.bic),
  };
  return (
    <AdminPage width="narrow">
      <AdminPageHeader eyebrow="Superadmin" title="Ma société" description="Ces informations apparaissent sur tes devis." backHref="/superadmin/devis" backLabel="Devis" />
      <CompanyForm initial={initial} />
    </AdminPage>
  );
}
