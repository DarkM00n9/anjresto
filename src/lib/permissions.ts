import type { AppRole } from "@/types/database";

export const ROLE_LABELS: Record<AppRole, string> = {
  superadmin: "Agence",
  owner: "Propriétaire",
  manager: "Gérant",
  staff: "Employé",
};

/** Rôles qui peuvent tout gérer sauf l'équipe et les infos légales. */
export const MANAGEMENT_ROLES: AppRole[] = ["superadmin", "owner", "manager"];
/** Tous les rôles : réservations du jour (statuts, ajout téléphone). */
export const ALL_ROLES: AppRole[] = ["superadmin", "owner", "manager", "staff"];
export const OWNER_ONLY: AppRole[] = ["superadmin", "owner"];

/** Rubriques du menu admin visibles selon le rôle. */
export function canSeeSection(role: AppRole, href: string): boolean {
  if (href === "/admin/equipe" || href === "/admin/infos") return OWNER_ONLY.includes(role);
  if (href === "/admin" || href === "/admin/reservations") return true;
  return MANAGEMENT_ROLES.includes(role);
}
