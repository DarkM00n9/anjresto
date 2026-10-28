import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Restaurant } from "@/types/database";

/**
 * Résout le restaurant courant à partir des headers posés par le middleware :
 * - `x-restaurant-slug` (mode local /r/{slug})
 * - `x-restaurant-host` (prod : sous-domaine {slug}.ROOT_DOMAIN ou domaine personnalisé)
 *
 * Mis en cache par requête (React `cache`) pour éviter les doublons entre
 * layout, page et generateMetadata.
 */
export const getCurrentRestaurant = cache(
  async (): Promise<Restaurant | null> => {
    const requestHeaders = await headers();
    const slug = requestHeaders.get("x-restaurant-slug");
    const host = requestHeaders.get("x-restaurant-host") ?? "";
    const hostname = host.split(":")[0];
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

    const supabase = await createClient();
    const query = supabase.from("restaurants").select("*").eq("is_published", true);

    let result;
    if (slug) {
      result = await query.eq("slug", slug).maybeSingle();
    } else if (rootDomain && hostname.endsWith(`.${rootDomain}`)) {
      const subdomain = hostname.slice(0, -(rootDomain.length + 1));
      result = await query.eq("slug", subdomain).maybeSingle();
    } else {
      result = await query.eq("custom_domain", hostname).maybeSingle();
    }

    if (result.error || !result.data) return null;
    return result.data as Restaurant;
  },
);

/** Variante qui déclenche la page 404 Next.js si aucun restaurant n'est résolu. */
export async function requireCurrentRestaurant(): Promise<Restaurant> {
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) notFound();
  return restaurant;
}

/** URL canonique du site courant (utile pour le SEO et les liens absolus). */
export const getBaseUrl = cache(async (): Promise<string> => {
  const requestHeaders = await headers();
  const slug = requestHeaders.get("x-restaurant-slug");
  const host = requestHeaders.get("x-restaurant-host") ?? requestHeaders.get("host") ?? "";

  if (slug) return `http://${host}/r/${slug}`;
  return `https://${host}`;
});
