import { requireAdminContext } from "@/app/admin/actions/guard";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getMenu } from "@/lib/get-menu";
import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export default async function NewMenuItemPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  await requireAdminContext();
  const restaurant = await requireCurrentRestaurant();
  const { categorie } = await searchParams;
  const { categories } = await getMenu(restaurant.id);
  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <AdminPage width="narrow">
      <AdminPageHeader title="Nouveau plat" description="Ajoute un plat et renseigne les informations affichées aux clients." backHref="/admin/carte" backLabel="Ma carte" />
      {sortedCategories.length === 0 ? (
        <Card className="flex flex-col items-start gap-3">
          <p className="text-sm text-slate-700">Crée d’abord une catégorie depuis ta carte pour pouvoir classer ce plat.</p>
          <ButtonLink href="/admin/carte" variant="accent" icon={<ArrowRight className="h-4 w-4" />}>Ouvrir ma carte</ButtonLink>
        </Card>
      ) : (
        <MenuItemForm restaurantId={restaurant.id} categories={sortedCategories} defaultCategoryId={categorie} />
      )}
    </AdminPage>
  );
}
