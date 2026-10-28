import { requireCurrentRestaurant, getBaseUrl } from "@/lib/get-current-restaurant";
import { getMenu, getOpeningHours } from "@/lib/get-menu";
import { getLayoutPreset } from "@/lib/layout-presets";
import { buildRestaurantJsonLd } from "@/lib/seo";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { MenuPreview } from "@/components/site/MenuPreview";
import { OpeningHoursBlock } from "@/components/site/OpeningHoursBlock";
import { LocationMap } from "@/components/site/LocationMap";
import { ContactSection } from "@/components/site/ContactSection";

export default async function HomePage() {
  const restaurant = await requireCurrentRestaurant();
  const preset = getLayoutPreset(restaurant.theme.layout_style);

  const [{ categories }, hours, baseUrl] = await Promise.all([
    getMenu(restaurant.id),
    getOpeningHours(restaurant.id),
    getBaseUrl(),
  ]);

  const jsonLd = buildRestaurantJsonLd(restaurant, baseUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero restaurant={restaurant} preset={preset} />
      <About restaurant={restaurant} preset={preset} />
      <MenuPreview categories={categories} preset={preset} />
      <OpeningHoursBlock hours={hours} preset={preset} />
      <LocationMap restaurant={restaurant} preset={preset} />
      <ContactSection restaurant={restaurant} preset={preset} />
    </>
  );
}
