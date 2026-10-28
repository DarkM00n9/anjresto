import type { MetadataRoute } from "next";
import { getCurrentRestaurant, getBaseUrl } from "@/lib/get-current-restaurant";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) return [];

  const baseUrl = await getBaseUrl();
  const now = new Date();

  return ["", "/carte", "/mentions-legales", "/confidentialite"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
  }));
}
