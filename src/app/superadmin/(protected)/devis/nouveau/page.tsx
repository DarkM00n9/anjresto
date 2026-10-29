import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";
import { QuoteForm } from "@/components/superadmin/QuoteForm";

export default async function NewQuotePage() {
  const { data } = await createAdminClient()
    .from("restaurants")
    .select("id, name, address_line, postal_code, city, email, phone")
    .order("name");
  const restaurants = (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    address: [r.address_line, [r.postal_code, r.city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    email: (r.email as string | null) ?? "",
    phone: (r.phone as string | null) ?? "",
  }));
  return (
    <AdminPage width="narrow">
      <AdminPageHeader eyebrow="Superadmin" title="Nouveau devis" backHref="/superadmin/devis" backLabel="Devis" />
      <QuoteForm restaurants={restaurants} />
    </AdminPage>
  );
}
