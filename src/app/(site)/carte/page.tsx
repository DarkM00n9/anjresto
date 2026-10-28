import type { Metadata } from "next";
import { requireCurrentRestaurant, getBaseUrl } from "@/lib/get-current-restaurant";
import { getMenu } from "@/lib/get-menu";
import { buildMenuJsonLd } from "@/lib/seo";
import { CategoryTabs } from "@/components/carte/CategoryTabs";
import { MenuItemCard } from "@/components/carte/MenuItemCard";
import { DailySpecialBanner } from "@/components/carte/DailySpecialBanner";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await requireCurrentRestaurant();
  return { title: `Carte — ${restaurant.name}` };
}

export default async function CartePage() {
  const restaurant = await requireCurrentRestaurant();
  const [{ categories, items }, baseUrl] = await Promise.all([
    getMenu(restaurant.id),
    getBaseUrl(),
  ]);

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);
  const jsonLd = buildMenuJsonLd(restaurant, categories, items, baseUrl);

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryTabs categories={sortedCategories} />
      <DailySpecialBanner items={items} />
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {sortedCategories.map((category) => (
          <section key={category.id} id={`categorie-${category.id}`} className="pt-8">
            <h2 className="font-[family-name:var(--font-title)] text-2xl font-bold text-[var(--color-secondary)]">
              {category.name}
            </h2>
            {category.description && (
              <p className="mt-1 text-sm text-black/60">{category.description}</p>
            )}
            <ul className="mt-2 divide-y divide-black/5">
              {items
                .filter((item) => item.category_id === category.id)
                .sort((a, b) => a.display_order - b.display_order)
                .map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
