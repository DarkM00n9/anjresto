import Link from "next/link";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getMenu } from "@/lib/get-menu";
import { MenuItemForm } from "@/components/admin/MenuItemForm";

export default async function NewMenuItemPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const restaurant = await requireCurrentRestaurant();
  const { categorie } = await searchParams;
  const { categories } = await getMenu(restaurant.id);
  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-3">
        <Link href="/admin/carte" className="text-sm text-neutral-500">
          ← Retour
        </Link>
        <h1 className="text-base font-semibold text-neutral-900">Nouveau plat</h1>
      </div>

      {sortedCategories.length === 0 ? (
        <p className="px-4 py-6 text-sm text-neutral-500">
          Crée d&apos;abord une catégorie depuis la page <Link href="/admin/carte" className="underline">Ma carte</Link>.
        </p>
      ) : (
        <MenuItemForm restaurantId={restaurant.id} categories={sortedCategories} defaultCategoryId={categorie} />
      )}
    </div>
  );
}
