import type { Restaurant } from "@/types/database";

/** Origine publique de prod d'un restaurant (jamais l'URL locale /r/{slug}). */
export function buildPublicOrigin(restaurant: Restaurant, rootDomain: string): string {
  const host = restaurant.custom_domain || `${restaurant.slug}.${rootDomain}`;
  return `https://${host}`;
}
