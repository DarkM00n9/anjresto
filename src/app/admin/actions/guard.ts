import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { requireOwnerForCurrentRestaurant } from "@/lib/auth";
import { MANAGEMENT_ROLES } from "@/lib/permissions";
import type { AppRole } from "@/types/database";
import { redirect } from "next/navigation";

/** À appeler en tête de chaque Server Action / page admin : vérifie session, resto et rôle autorisé. */
export async function requireAdminContext(allowed: AppRole[] = MANAGEMENT_ROLES) {
  const restaurant = await requireCurrentRestaurant();
  const profile = await requireOwnerForCurrentRestaurant(restaurant.id);
  if (!allowed.includes(profile.role)) redirect("/admin");
  return { restaurant, profile };
}
