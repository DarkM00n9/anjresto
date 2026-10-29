import { requireAdminContext } from "@/app/admin/actions/guard";
import { notFound } from "next/navigation";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getMenu } from "@/lib/get-menu";
import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default async function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminContext();
  const restaurant = await requireCurrentRestaurant();
  const { id } = await params;
  const { categories, items } = await getMenu(restaurant.id);
  const item = items.find((i) => i.id === id);

  if (!item) notFound();

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <AdminPage width="narrow">
      <AdminPageHeader title={item.name} description="Modifie les détails de ce plat ou indique-le comme épuisé depuis ta carte." backHref="/admin/carte" backLabel="Ma carte" />
      <MenuItemForm restaurantId={restaurant.id} categories={sortedCategories} item={item} />
    </AdminPage>
  );
}
