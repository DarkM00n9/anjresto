import Link from "next/link";
import { BellRing, ArrowRight } from "lucide-react";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { listTodayAndTomorrowReservations, countPendingReservations } from "@/lib/get-reservations";
import { DashboardReservations } from "@/components/admin/DashboardReservations";
import { QuickLinks } from "@/components/admin/QuickLinks";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default async function AdminDashboardPage() {
  const restaurant = await requireCurrentRestaurant();
  const [reservations, pending] = await Promise.all([
    listTodayAndTomorrowReservations(restaurant.id),
    countPendingReservations(restaurant.id),
  ]);

  return (
    <AdminPage>
      <AdminPageHeader title="Bonjour" description={restaurant.name} eyebrow="Tableau de bord" />
      {pending > 0 && (
        <Link
          href="/admin/reservations"
          className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex items-center gap-3 text-sm font-semibold sm:text-base">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200">
              <BellRing className="h-5 w-5" />
            </span>
            {pending} {pending === 1 ? "demande de réservation attend" : "demandes de réservation attendent"} ta validation
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" />
        </Link>
      )}
      <QuickLinks />
      <DashboardReservations reservations={reservations} />
    </AdminPage>
  );
}
