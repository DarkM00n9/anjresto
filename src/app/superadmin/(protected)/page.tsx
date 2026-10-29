import { listRestaurantsOverview } from "@/lib/superadmin/get-restaurants-overview";
import { RestaurantsList } from "@/components/superadmin/RestaurantsList";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { ButtonLink } from "@/components/ui/Button";
import { Plus } from "lucide-react";

function fourteenDaysAgo() {
  return Date.now() - 14 * 86400000;
}

export default async function SuperadminHomePage() {
  const restaurants = await listRestaurantsOverview();
  const totalReservations = restaurants.reduce((s, r) => s + r.reservationsThisMonth, 0);
  const mrr = restaurants.filter((r) => r.subscription_status === "paid").reduce((s, r) => s + Number(r.monthly_price), 0);
  const unpaid = restaurants.filter((r) => r.subscription_status === "unpaid");
  const inactiveSince = fourteenDaysAgo();
  const dormant = restaurants.filter((r) => r.status !== "suspended" && (!r.ownerLastSignInAt || new Date(r.ownerLastSignInAt).getTime() < inactiveSince));

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Administration ANJ Agency"
        title="Restaurants"
        description="Gère les établissements, leur accès et leur site public."
        action={<ButtonLink href="/superadmin/nouveau" variant="accent" icon={<Plus className="h-4 w-4" />}>Nouveau restaurant</ButtonLink>}
      />
      {(unpaid.length > 0 || dormant.length > 0) && (
        <div className="mb-4 space-y-2">
          {unpaid.length > 0 && <p className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-semibold text-rose-900">Impayés : {unpaid.map((r) => r.name).join(", ")}</p>}
          {dormant.length > 0 && <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900">Pas connectés depuis 14 jours : {dormant.map((r) => r.name).join(", ")}</p>}
        </div>
      )}
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AdminPanel className="p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Résa. ce mois</p><p className="mt-1 text-2xl font-bold text-slate-900">{totalReservations}</p></AdminPanel>
        <AdminPanel className="p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Revenu mensuel</p><p className="mt-1 text-2xl font-bold text-emerald-700">{mrr.toFixed(0)} €</p></AdminPanel>
        <AdminPanel className="p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Impayés</p><p className="mt-1 text-2xl font-bold text-rose-700">{unpaid.length}</p></AdminPanel>
        <AdminPanel className="p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Inactifs</p><p className="mt-1 text-2xl font-bold text-amber-700">{dormant.length}</p></AdminPanel>
      </div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <AdminPanel className="p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Total</p><p className="mt-1 text-2xl font-bold text-slate-900">{restaurants.length}</p></AdminPanel>
        <AdminPanel className="p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Actifs</p><p className="mt-1 text-2xl font-bold text-emerald-700">{restaurants.filter((restaurant) => restaurant.status === "active").length}</p></AdminPanel>
        <AdminPanel className="p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Démo</p><p className="mt-1 text-2xl font-bold text-amber-700">{restaurants.filter((restaurant) => restaurant.status === "demo").length}</p></AdminPanel>
      </div>
      <RestaurantsList restaurants={restaurants} />
    </AdminPage>
  );
}
