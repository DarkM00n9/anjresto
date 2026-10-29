import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getReservationSettings } from "@/lib/get-reservations";
import { ReservationSettingsForm } from "@/components/admin/reservations/ReservationSettingsForm";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default async function ReservationSettingsPage() {
  const restaurant = await requireCurrentRestaurant();
  const settings = await getReservationSettings(restaurant.id);

  return (
    <AdminPage width="narrow">
      <AdminPageHeader title="Réglages des réservations" description="Définis les créneaux et la capacité de réservation en ligne." backHref="/admin/reservations" backLabel="Réservations" />
      <ReservationSettingsForm settings={settings} />
    </AdminPage>
  );
}
