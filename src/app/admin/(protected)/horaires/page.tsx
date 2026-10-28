import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getOpeningHours, getClosures } from "@/lib/get-menu";
import { HoursEditor } from "@/components/admin/HoursEditor";
import { ClosuresManager } from "@/components/admin/ClosuresManager";

export default async function AdminHoursPage() {
  const restaurant = await requireCurrentRestaurant();
  const [hours, closures] = await Promise.all([getOpeningHours(restaurant.id), getClosures(restaurant.id)]);

  return (
    <div>
      <div className="border-b border-neutral-200 bg-white px-4 py-3">
        <h1 className="text-base font-semibold text-neutral-900">Horaires</h1>
      </div>
      <HoursEditor hours={hours} />
      <ClosuresManager closures={closures} />
    </div>
  );
}
