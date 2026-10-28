import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { requireOwnerForCurrentRestaurant } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const restaurant = await requireCurrentRestaurant();
  await requireOwnerForCurrentRestaurant(restaurant.id);

  return <AdminShell restaurant={restaurant}>{children}</AdminShell>;
}
