import { requireAdminContext } from "@/app/admin/actions/guard";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getMenu } from "@/lib/get-menu";
import { CarteManager } from "@/components/admin/CarteManager";

export default async function AdminCartePage() {
  await requireAdminContext();
  const restaurant = await requireCurrentRestaurant();
  const { categories, items } = await getMenu(restaurant.id);

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);
  const sortedItems = [...items].sort((a, b) => a.display_order - b.display_order);

  return <CarteManager categories={sortedCategories} items={sortedItems} />;
}
