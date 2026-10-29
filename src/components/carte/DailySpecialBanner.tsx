import type { MenuItem } from "@/types/database";
import { Sparkles } from "lucide-react";
import { getT, getLocalize } from "@/lib/lang";


export async function DailySpecialBanner({ items }: { items: MenuItem[] }) {
  const t = await getT();
  const L = await getLocalize();
  const specials = items.filter((item) => item.is_daily_special && item.is_available);
  if (specials.length === 0) return null;

  return (
    <div className="mx-auto mt-4 max-w-4xl px-4 sm:px-6">
      <div className="border-y border-[var(--color-primary)]/20 px-5 py-6 sm:px-7">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]"><Sparkles className="h-3.5 w-3.5" />{t("Suggestion du chef")}</p>
      <ul className="mt-3 divide-y divide-black/[0.07]">
        {specials.map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-4 py-3 text-sm first:pt-2 last:pb-0">
            <span className="font-[family-name:var(--font-title)] text-base font-medium text-[var(--color-secondary)] sm:text-lg">{L(item.name, item.name_en)}</span>
            <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-[var(--color-primary)]">{item.price.toFixed(2)} €</span>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}
