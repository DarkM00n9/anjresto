import Image from "next/image";
import type { MenuItem } from "@/types/database";
import { DietBadges } from "./DietBadges";
import { AllergenList } from "./AllergenList";

export function MenuItemCard({ item }: { item: MenuItem }) {
  if (!item.is_available) {
    return (
      <li className="flex gap-4 py-4 opacity-40">
        <div className="flex-1">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-medium text-black/70">{item.name}</h3>
            <span className="text-sm font-semibold text-black/50">Épuisé</span>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="flex gap-4 py-4">
      {item.photo_url && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          <Image src={item.photo_url} alt={item.name} fill className="object-cover" sizes="80px" />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-medium text-black/90">{item.name}</h3>
          <span className="whitespace-nowrap font-semibold text-[var(--color-primary)]">
            {item.price.toFixed(2)} €
          </span>
        </div>
        {item.description && <p className="mt-1 text-sm text-black/60">{item.description}</p>}
        <div className="mt-2">
          <DietBadges item={item} />
        </div>
        <AllergenList allergens={item.allergens} />
      </div>
    </li>
  );
}
