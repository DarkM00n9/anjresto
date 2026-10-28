import Link from "next/link";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getReservationSettings } from "@/lib/get-reservations";
import { ReservationSettingsForm } from "@/components/admin/reservations/ReservationSettingsForm";

export default async function ReservationSettingsPage() {
  const restaurant = await requireCurrentRestaurant();
  const settings = await getReservationSettings(restaurant.id);

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-3">
        <Link href="/admin/reservations" className="text-sm text-neutral-500">
          ← Retour
        </Link>
        <h1 className="text-base font-semibold text-neutral-900">Réglages des réservations</h1>
      </div>
      <ReservationSettingsForm settings={settings} />
    </div>
  );
}
