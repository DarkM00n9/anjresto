import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { requireOwnerForCurrentRestaurant } from "@/lib/auth";

/** À appeler en tête de chaque Server Action admin : vérifie session + resto. */
export async function requireAdminContext() {
  const restaurant = await requireCurrentRestaurant();
  const profile = await requireOwnerForCurrentRestaurant(restaurant.id);
  return { restaurant, profile };
}
