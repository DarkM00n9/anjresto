import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { listReservationsForDate, getBlockedServices } from "@/lib/get-reservations";
import { getOpeningHours } from "@/lib/get-menu";
import { todayInParis } from "@/lib/closures";
import { ReservationsDayView } from "@/components/admin/reservations/ReservationsDayView";

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const restaurant = await requireCurrentRestaurant();
  const { date: dateParam } = await searchParams;
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayInParis();

  const [reservations, hours, blockedServices] = await Promise.all([
    listReservationsForDate(restaurant.id, date),
    getOpeningHours(restaurant.id),
    getBlockedServices(restaurant.id, date),
  ]);

  return (
    <ReservationsDayView date={date} reservations={reservations} hours={hours} blockedServices={blockedServices} />
  );
}
