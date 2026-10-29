import { requireAdminContext } from "@/app/admin/actions/guard";
import { OWNER_ONLY } from "@/lib/permissions";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { RestaurantInfoForm } from "@/components/admin/RestaurantInfoForm";
import { TranslateButton } from "@/components/admin/TranslateButton";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default async function AdminInfosPage() {
  await requireAdminContext(OWNER_ONLY);
  const restaurant = await requireCurrentRestaurant();

  return (
    <AdminPage width="narrow">
      <AdminPageHeader title="Infos du restaurant" description="Ces informations apparaissent sur le site public de ton établissement." />
      <TranslateButton />
      <RestaurantInfoForm restaurant={restaurant} />
    </AdminPage>
  );
}
