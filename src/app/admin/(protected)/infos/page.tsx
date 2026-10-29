import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { RestaurantInfoForm } from "@/components/admin/RestaurantInfoForm";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default async function AdminInfosPage() {
  const restaurant = await requireCurrentRestaurant();

  return (
    <AdminPage width="narrow">
      <AdminPageHeader title="Infos du restaurant" description="Ces informations apparaissent sur le site public de ton établissement." />
      <RestaurantInfoForm restaurant={restaurant} />
    </AdminPage>
  );
}
