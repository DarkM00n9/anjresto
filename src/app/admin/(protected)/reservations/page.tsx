import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { listReservationsForDate, getBlockedServices, getReservationSettings } from "@/lib/get-reservations";
import { getOpeningHours } from "@/lib/get-menu";
import { todayInParis } from "@/lib/closures";
import { ReservationsDayView } from "@/components/admin/reservations/ReservationsDayView";
import { AdminPage } from "@/components/admin/AdminPage";
import { createClient } from "@/lib/supabase/server";
import type { WaitlistEntry } from "@/types/database";

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const restaurant = await requireCurrentRestaurant();
  const { date: dateParam } = await searchParams;
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayInParis();

  const [reservations, hours, blockedServices, settings] = await Promise.all([
    listReservationsForDate(restaurant.id, date),
    getOpeningHours(restaurant.id),
    getBlockedServices(restaurant.id, date),
    getReservationSettings(restaurant.id),
  ]);

  const supabase = await createClient();
  const { data: waitlist } = await supabase
    .from("waitlist")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("wanted_date", date)
    .neq("status", "done")
    .order("created_at");

  return (
    <AdminPage>
      <ReservationsDayView date={date} reservations={reservations} hours={hours} blockedServices={blockedServices} settings={settings} waitlist={(waitlist ?? []) as WaitlistEntry[]} />
    </AdminPage>
  );
}
