import { notFound } from "next/navigation";
import { getRestaurantOverview } from "@/lib/superadmin/get-restaurants-overview";
import { MenuImportReview } from "@/components/superadmin/MenuImportReview";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default async function ImportMenuPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const restaurant = await getRestaurantOverview(restaurantId);
  if (!restaurant) notFound();

  return (
    <AdminPage width="narrow">
      <AdminPageHeader eyebrow={`Superadmin · ${restaurant.name}`} title="Importer une carte" description="Colle le texte de la carte. Vérifie ensuite les catégories et les plats avant de les ajouter." backHref={`/superadmin/${restaurantId}`} backLabel={restaurant.name} />
      <MenuImportReview restaurantId={restaurantId} />
    </AdminPage>
  );
}
