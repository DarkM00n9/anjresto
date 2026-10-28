import type { Metadata } from "next";
import { requireCurrentRestaurant, getBaseUrl } from "@/lib/get-current-restaurant";
import { resolveTitleFont, themeCssVars } from "@/lib/theme";
import { buildRestaurantMetadata } from "@/lib/seo";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await requireCurrentRestaurant();
  const baseUrl = await getBaseUrl();
  return buildRestaurantMetadata(restaurant, baseUrl);
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const restaurant = await requireCurrentRestaurant();
  const font = resolveTitleFont(restaurant.theme.font_title);

  return (
    <div className={font.variable} style={themeCssVars(restaurant)}>
      <SiteHeader restaurant={restaurant} />
      {children}
      <SiteFooter restaurant={restaurant} />
    </div>
  );
}
