"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import type { Category, MenuItem } from "@/types/database";
import { MenuItemCard } from "./MenuItemCard";
import { useT } from "@/components/site/LangProvider";

const FILTERS = [
  { key: "is_vegetarian", label: "Végétarien" },
  { key: "is_vegan", label: "Vegan" },
  { key: "is_gluten_free", label: "Sans gluten" },
  { key: "is_homemade", label: "Fait maison" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

/** Liste de la carte avec filtres alimentaires (côté client) et export PDF via l'impression du navigateur. */
export function CarteList({ categories, items }: { categories: Category[]; items: MenuItem[] }) {
  const t = useT();
  const [active, setActive] = useState<FilterKey[]>([]);

  const visible = items.filter((item) => active.every((key) => item[key]));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <div className="no-print flex flex-wrap items-center gap-2 pt-8">
        {FILTERS.map((f) => {
          const on = active.includes(f.key);
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(on ? active.filter((k) => k !== f.key) : [...active, f.key])}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                on
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-stone-400 bg-white text-stone-800 hover:border-[var(--color-primary)]"
              }`}
            >
              {t(f.label)}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => window.print()}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-stone-400 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:border-[var(--color-primary)]"
        >
          <Printer className="h-3.5 w-3.5" /> {t("Télécharger en PDF")}
        </button>
      </div>

      {categories.map((category) => {
        const list = visible.filter((i) => i.category_id === category.id).sort((a, b) => a.display_order - b.display_order);
        if (list.length === 0) return null;
        return (
          <section key={category.id} id={`categorie-${category.id}`} className="scroll-mt-36 border-b border-black/10 pb-8 pt-12 last:border-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">{t("À la carte")}</p>
                <h2 className="font-[family-name:var(--font-title)] text-3xl font-normal tracking-tight text-[var(--color-secondary)] sm:text-4xl">
                  {category.name}
                </h2>
              </div>
              {category.description && <p className="max-w-sm text-sm leading-6 text-stone-600 sm:text-right">{category.description}</p>}
            </div>
            <ul className="mt-5 divide-y divide-black/[0.07] border-t border-black/[0.07]">
              {list.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </ul>
          </section>
        );
      })}
      {active.length > 0 && visible.length === 0 && (
        <p className="py-12 text-center text-sm text-stone-700">{t("Aucun plat ne correspond à ces filtres.")}</p>
      )}
    </div>
  );
}
