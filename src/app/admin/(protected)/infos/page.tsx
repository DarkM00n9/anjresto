import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { RestaurantInfoForm } from "@/components/admin/RestaurantInfoForm";

export default async function AdminInfosPage() {
  const restaurant = await requireCurrentRestaurant();

  return (
    <div>
      <div className="border-b border-neutral-200 bg-white px-4 py-3">
        <h1 className="text-base font-semibold text-neutral-900">Infos du restaurant</h1>
      </div>
      <RestaurantInfoForm restaurant={restaurant} />
    </div>
  );
}
