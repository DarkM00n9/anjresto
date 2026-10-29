import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getOpeningHours, getClosures } from "@/lib/get-menu";
import { HoursEditor } from "@/components/admin/HoursEditor";
import { ClosuresManager } from "@/components/admin/ClosuresManager";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default async function AdminHoursPage() {
  const restaurant = await requireCurrentRestaurant();
  const [hours, closures] = await Promise.all([getOpeningHours(restaurant.id), getClosures(restaurant.id)]);

  return (
    <AdminPage>
      <AdminPageHeader title="Horaires" description="Indique tes horaires habituels et les fermetures prévues." />
      <HoursEditor hours={hours} />
      <ClosuresManager closures={closures} />
    </AdminPage>
  );
}
