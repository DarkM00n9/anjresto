import { notFound } from "next/navigation";
import { getRestaurantOverview } from "@/lib/superadmin/get-restaurants-overview";
import { RestaurantStatusActions } from "@/components/superadmin/RestaurantStatusActions";
import { CustomDomainForm } from "@/components/superadmin/CustomDomainForm";
import { LayoutStyleForm } from "@/components/superadmin/LayoutStyleForm";
import { BillingForm } from "@/components/superadmin/BillingForm";
import { DuplicateForm } from "@/components/superadmin/DuplicateForm";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowUpRight, FileUp, LogIn } from "lucide-react";

function formatDate(iso: string | null): string {
  if (!iso) return "jamais";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const restaurant = await getRestaurantOverview(restaurantId);
  if (!restaurant) notFound();

  return (
    <AdminPage width="narrow">
      <AdminPageHeader eyebrow="Superadmin · Fiche restaurant" title={restaurant.name} description={`/${restaurant.slug}`} backHref="/superadmin" backLabel="Tous les restaurants" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AdminPanel className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Créé le</p><p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(restaurant.created_at)}</p></AdminPanel>
        <AdminPanel className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Réservations</p><p className="mt-2 text-sm font-semibold text-slate-900">{restaurant.reservationsThisMonth} ce mois-ci</p></AdminPanel>
        <AdminPanel className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Propriétaire</p><p className="mt-2 truncate text-sm font-semibold text-slate-900">{restaurant.ownerEmail ?? "Aucun"}</p></AdminPanel>
        <AdminPanel className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Dernière connexion</p><p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(restaurant.ownerLastSignInAt)}</p></AdminPanel>
      </div>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Statut du site</h2>
        <RestaurantStatusActions restaurantId={restaurant.id} status={restaurant.status} />
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Actions rapides</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <a href={`/superadmin/impersonate/${restaurant.id}`} className="group flex items-center gap-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><LogIn className="h-5 w-5" /></span>
            <span className="flex-1"><span className="block text-sm font-semibold text-slate-900">Ouvrir l’administration</span><span className="mt-0.5 block text-xs text-slate-700">Accès temporaire à son espace</span></span>
            <ArrowUpRight className="h-4 w-4 text-slate-700 transition-colors group-hover:text-indigo-600" />
          </a>
          <ButtonLink href={`/superadmin/${restaurant.id}/importer-carte`} variant="secondary" className="justify-start rounded-2xl px-4 py-4" icon={<FileUp className="h-5 w-5 text-indigo-600" />}>
            Importer une carte
          </ButtonLink>
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Apparence</h2>
        <LayoutStyleForm restaurantId={restaurant.id} current={restaurant.theme.layout_style} />
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Facturation</h2>
        <BillingForm restaurantId={restaurant.id} status={restaurant.subscription_status} paidUntil={restaurant.paid_until} monthlyPrice={restaurant.monthly_price} />
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Dupliquer</h2>
        <DuplicateForm sourceId={restaurant.id} />
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Domaine personnalisé</h2>
        <CustomDomainForm restaurantId={restaurant.id} currentDomain={restaurant.custom_domain} />
      </section>
    </AdminPage>
  );
}
