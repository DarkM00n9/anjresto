import type { MetadataRoute } from "next";
import { getBaseUrl, getCurrentRestaurant } from "@/lib/get-current-restaurant";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getBaseUrl();
  const restaurant = await getCurrentRestaurant();

  // Un site en démo ou suspendu ne doit pas être indexé.
  if (!restaurant || restaurant.status !== "active") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/superadmin", "/resa", "/annulation", "/api"] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
