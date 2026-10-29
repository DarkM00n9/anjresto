import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getActiveDailyMenu } from "@/lib/get-menu";
import { DailyMenuForm } from "@/components/admin/DailyMenuForm";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default async function AdminDailyMenuPage() {
  const restaurant = await requireCurrentRestaurant();
  const dailyMenu = await getActiveDailyMenu(restaurant.id);

  return (
    <AdminPage width="narrow">
      <AdminPageHeader title="Menu du jour" description="Mets à jour le menu proposé aujourd’hui à tes clients." />
      <DailyMenuForm dailyMenu={dailyMenu} />
    </AdminPage>
  );
}
