import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getMenu } from "@/lib/get-menu";
import { MenuItemForm } from "@/components/admin/MenuItemForm";

export default async function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const restaurant = await requireCurrentRestaurant();
  const { id } = await params;
  const { categories, items } = await getMenu(restaurant.id);
  const item = items.find((i) => i.id === id);

  if (!item) notFound();

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-3">
        <Link href="/admin/carte" className="text-sm text-neutral-500">
          ← Retour
        </Link>
        <h1 className="truncate text-base font-semibold text-neutral-900">{item.name}</h1>
      </div>

      <MenuItemForm restaurantId={restaurant.id} categories={sortedCategories} item={item} />
    </div>
  );
}
