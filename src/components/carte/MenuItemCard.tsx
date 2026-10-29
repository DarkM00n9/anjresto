"use client";

import Image from "next/image";
import type { MenuItem } from "@/types/database";
import { DietBadges } from "./DietBadges";
import { AllergenList } from "./AllergenList";
import { useT, useLocalize } from "@/components/site/LangProvider";


export function MenuItemCard({ item }: { item: MenuItem }) {
  const t = useT();
  const L = useLocalize();
  if (!item.is_available) {
    return (
      <li className="flex gap-4 py-5 opacity-55 sm:py-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-[family-name:var(--font-title)] text-lg font-medium text-stone-700">{L(item.name, item.name_en)}</h3>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">{t("Épuisé")}</span>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="group flex gap-5 py-5 sm:py-6">
      {item.photo_url && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-28 sm:w-28">
          <Image src={item.photo_url} alt={L(item.name, item.name_en) ?? ""} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes="112px" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-[family-name:var(--font-title)] text-lg font-medium leading-snug text-[var(--color-secondary)] sm:text-xl">{L(item.name, item.name_en)}</h3>
          <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-[var(--color-primary)] sm:text-base">
            {item.price.toFixed(2)} €
          </span>
        </div>
        {item.description && <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-600">{L(item.description, item.description_en)}</p>}
        <div className="mt-2">
          <DietBadges item={item} />
        </div>
        <AllergenList allergens={item.allergens} />
      </div>
    </li>
  );
}
