import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { listTodayAndTomorrowReservations } from "@/lib/get-reservations";
import { DashboardReservations } from "@/components/admin/DashboardReservations";
import { QuickLinks } from "@/components/admin/QuickLinks";

export default async function AdminDashboardPage() {
  const restaurant = await requireCurrentRestaurant();
  const reservations = await listTodayAndTomorrowReservations(restaurant.id);

  return (
    <div className="px-4 py-6 sm:px-6">
      <h1 className="text-xl font-bold text-neutral-900">Bonjour 👋</h1>
      <p className="mt-1 text-sm text-neutral-500">{restaurant.name}</p>

      <QuickLinks />
      <DashboardReservations reservations={reservations} />
    </div>
  );
}
