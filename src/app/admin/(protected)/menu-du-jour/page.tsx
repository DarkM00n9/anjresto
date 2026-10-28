import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getActiveDailyMenu } from "@/lib/get-menu";
import { DailyMenuForm } from "@/components/admin/DailyMenuForm";

export default async function AdminDailyMenuPage() {
  const restaurant = await requireCurrentRestaurant();
  const dailyMenu = await getActiveDailyMenu(restaurant.id);

  return (
    <div>
      <div className="border-b border-neutral-200 bg-white px-4 py-3">
        <h1 className="text-base font-semibold text-neutral-900">Menu du jour</h1>
      </div>
      <DailyMenuForm dailyMenu={dailyMenu} />
    </div>
  );
}
