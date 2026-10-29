import { Reveal } from "@/components/ui/Reveal";
import { requireCurrentRestaurant, getBaseUrl } from "@/lib/get-current-restaurant";
import { getMenu, getOpeningHours, getClosures } from "@/lib/get-menu";
import { getLayoutPreset } from "@/lib/layout-presets";
import { buildRestaurantJsonLd } from "@/lib/seo";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { MenuPreview } from "@/components/site/MenuPreview";
import { OpeningHoursBlock } from "@/components/site/OpeningHoursBlock";
import { LocationMap } from "@/components/site/LocationMap";
import { ContactSection } from "@/components/site/ContactSection";
import { ModernAbout, ModernContact, ModernVisit, ModernMenu } from "@/components/site/modern/ModernSections";

export default async function HomePage() {
  const restaurant = await requireCurrentRestaurant();
  const preset = getLayoutPreset(restaurant.theme.layout_style);

  const [{ categories, items }, hours, closures, baseUrl] = await Promise.all([
    getMenu(restaurant.id),
    getOpeningHours(restaurant.id),
    getClosures(restaurant.id),
    getBaseUrl(),
  ]);

  const jsonLd = buildRestaurantJsonLd(restaurant, baseUrl, hours);

  const modern = preset.heroVariant === "diagonal";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero restaurant={restaurant} preset={preset} />
      {modern ? (
        <>
          <Reveal><ModernAbout restaurant={restaurant} /></Reveal>
          <ModernMenu categories={categories} items={items} restaurant={restaurant} />
          <Reveal><ModernVisit hours={hours} closures={closures} restaurant={restaurant} /></Reveal>
          <Reveal><ModernContact restaurant={restaurant} /></Reveal>
        </>
      ) : (
        <>
      <Reveal><About restaurant={restaurant} preset={preset} /></Reveal>
      <Reveal><MenuPreview categories={categories} items={items} /></Reveal>
      <Reveal><OpeningHoursBlock hours={hours} closures={closures} /></Reveal>
      <Reveal><LocationMap restaurant={restaurant} preset={preset} /></Reveal>
      <Reveal><ContactSection restaurant={restaurant} /></Reveal>
        </>
      )}
    </>
  );
}
