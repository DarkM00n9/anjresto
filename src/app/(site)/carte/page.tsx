import type { Metadata } from "next";
import { requireCurrentRestaurant, getBaseUrl } from "@/lib/get-current-restaurant";
import { getMenu, getActiveDailyMenu } from "@/lib/get-menu";
import { buildMenuJsonLd } from "@/lib/seo";
import { CategoryTabs } from "@/components/carte/CategoryTabs";
import { CarteList } from "@/components/carte/CarteList";
import { DailySpecialBanner } from "@/components/carte/DailySpecialBanner";
import { DailyMenuBanner } from "@/components/carte/DailyMenuBanner";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowUpRight } from "lucide-react";
import { getLayoutPreset } from "@/lib/layout-presets";
import { getT, getLocalize } from "@/lib/lang";


export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await requireCurrentRestaurant();
  return {
    title: `Carte — ${restaurant.name}`,
    description: `La carte de ${restaurant.name}${restaurant.city ? ` à ${restaurant.city}` : ""} : plats, menu du jour et allergènes.`,
    alternates: { canonical: "/carte" },
  };
}

export default async function CartePage() {
  const restaurant = await requireCurrentRestaurant();
  const t = await getT();
  const L = await getLocalize();
  const [{ categories, items }, dailyMenu, baseUrl] = await Promise.all([
    getMenu(restaurant.id),
    getActiveDailyMenu(restaurant.id),
    getBaseUrl(),
  ]);

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);
  const modern = getLayoutPreset(restaurant.theme.layout_style).heroVariant === "diagonal";
  const jsonLd = buildMenuJsonLd(restaurant, categories, items, baseUrl);

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className={modern ? "maison-home relative isolate overflow-hidden px-5 py-12 sm:px-8 sm:py-20" : "bg-stone-200 px-4 py-14 sm:py-20"}>
        {modern && <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-[var(--color-secondary)] [clip-path:polygon(84%_0,100%_0,100%_100%,70%_100%)] lg:block" />}
        <div className="mx-auto grid max-w-6xl items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              <span className="h-px w-8 bg-[var(--color-primary)]" />{t("À découvrir")}
            </p>
            <h1 className="mt-5 max-w-4xl break-words font-[family-name:var(--font-title)] text-[clamp(2.25rem,9vw,3.75rem)] font-normal leading-[1.05] tracking-[-0.035em] text-[var(--color-secondary)]">
              {t("La carte de")} {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="mt-4 max-w-xl text-base leading-7 text-stone-700">{L(restaurant.tagline, restaurant.tagline_en)}</p>}
          </div>
          <div className="flex flex-col items-start gap-3 border-l border-black/10 pl-5 md:items-end md:border-l-0 md:pl-0">
            {restaurant.cuisine_type && <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${modern ? "text-stone-600 lg:text-white/85" : "text-stone-600"}`}>{restaurant.cuisine_type}</p>}
            <ButtonLink href="/reservation" variant={modern ? "primary" : "outline"} size="sm" icon={<ArrowUpRight className="h-3.5 w-3.5" />}>{t("Réserver une table")}</ButtonLink>
          </div>
        </div>
      </section>
      <CategoryTabs categories={sortedCategories} />
      <DailyMenuBanner dailyMenu={dailyMenu} />
      <DailySpecialBanner items={items} />
      <CarteList categories={sortedCategories} items={items} />
    </div>
  );
}
