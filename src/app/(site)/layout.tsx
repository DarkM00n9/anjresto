import type { Metadata } from "next";
import { requireCurrentRestaurant, getBaseUrl } from "@/lib/get-current-restaurant";
import { resolveTitleFont, themeCssVars } from "@/lib/theme";
import { buildRestaurantMetadata } from "@/lib/seo";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { DemoBanner } from "@/components/site/DemoBanner";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { LangProvider } from "@/components/site/LangProvider";
import { getLang } from "@/lib/lang";
import { SuspendedPage } from "@/components/site/SuspendedPage";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await requireCurrentRestaurant();
  if (restaurant.status === "suspended") {
    return { title: "Site indisponible", robots: { index: false, follow: false } };
  }
  const baseUrl = await getBaseUrl();
  return buildRestaurantMetadata(restaurant, baseUrl);
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const restaurant = await requireCurrentRestaurant();

  if (restaurant.status === "suspended") {
    return <SuspendedPage />;
  }

  const lang = await getLang();
  const font = resolveTitleFont(restaurant.theme.font_title);

  return (
    <div className={`${font.variable} bg-stone-100`} style={themeCssVars(restaurant)}>
      <LangProvider lang={lang}>
      <ScrollProgress />
      {restaurant.status === "demo" && <DemoBanner />}
      <SiteHeader restaurant={restaurant} />
      {children}
      <SiteFooter restaurant={restaurant} />
      </LangProvider>
    </div>
  );
}
