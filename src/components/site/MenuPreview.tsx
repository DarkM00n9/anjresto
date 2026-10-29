import type { Category, MenuItem } from "@/types/database";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowUpRight } from "lucide-react";

interface MenuPreviewProps {
  categories: Category[];
  items: MenuItem[];
}

export function MenuPreview({ categories, items }: MenuPreviewProps) {
  if (categories.length === 0 && items.length === 0) return null;

  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const previewItems = [...items]
    .filter((item) => item.is_available)
    .sort(
      (a, b) =>
        Number(b.is_daily_special) - Number(a.is_daily_special) ||
        Number(Boolean(b.photo_url)) - Number(Boolean(a.photo_url)) ||
        a.display_order - b.display_order,
    )
    .slice(0, 4);

  return (
    <Section spacing="py-20 md:py-32" className="bg-white">
      <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div className="flex flex-col items-start">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            <span className="h-px w-8 bg-[var(--color-primary)]" />La carte
          </p>
          <h2 className="mt-6 max-w-md font-[family-name:var(--font-title)] text-4xl font-normal leading-[1.05] tracking-[-0.035em] text-[var(--color-secondary)] sm:text-5xl lg:text-6xl">
            Un avant-goût de la maison
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-stone-700">
            Découvrez quelques suggestions, puis parcourez la carte complète et ses menus du moment.
          </p>

          {categories.length > 0 && (
            <ul className="mt-9 grid grid-cols-2 gap-x-7 gap-y-3 border-t border-black/10 pt-5 text-xs font-medium uppercase tracking-[0.12em] text-stone-600 sm:grid-cols-3 lg:grid-cols-2">
              {categories.map((category) => (
                <li key={category.id}>{category.name}</li>
              ))}
            </ul>
          )}

          <div className="mt-9 hidden lg:block">
            <ButtonLink href="/carte" variant="outline" icon={<ArrowUpRight className="h-4 w-4" />}>
              Découvrir toute la carte
            </ButtonLink>
          </div>
        </div>

        {previewItems.length > 0 ? (
          <div className="self-center border-t border-black/10">
            {previewItems.map((item, index) => (
              <article key={item.id} className="grid grid-cols-[2rem_1fr_auto] gap-3 border-b border-black/10 py-5 sm:grid-cols-[2.5rem_1fr_auto] sm:gap-5 sm:py-7">
                <span className="pt-1 font-[family-name:var(--font-title)] text-base italic text-[var(--color-primary)]/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  {categoryNames.has(item.category_id) && (
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">
                      {categoryNames.get(item.category_id)}
                    </p>
                  )}
                  <h3 className="font-[family-name:var(--font-title)] text-lg font-medium leading-snug text-[var(--color-secondary)] sm:text-xl">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="mt-1.5 max-w-lg text-sm leading-6 text-stone-600">{item.description}</p>
                  )}
                </div>
                <span className="pt-1 text-sm font-semibold tabular-nums text-[var(--color-primary)] sm:text-base">
                  {item.price.toFixed(2)} €
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid content-center border-t border-black/10 sm:grid-cols-2">
            {categories.map((category, index) => (
              <article key={category.id} className="border-b border-black/10 py-6 sm:px-5 sm:first:pl-0">
                <p className="font-[family-name:var(--font-title)] text-base italic text-[var(--color-primary)]/70">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-[family-name:var(--font-title)] text-xl font-medium text-[var(--color-secondary)]">{category.name}</h3>
                {category.description && <p className="mt-1 text-sm leading-6 text-stone-600">{category.description}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="mt-9 lg:hidden">
        <ButtonLink href="/carte" variant="outline" icon={<ArrowUpRight className="h-4 w-4" />}>
          Découvrir toute la carte
        </ButtonLink>
      </div>
    </Section>
  );
}
