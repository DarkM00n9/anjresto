import type { MenuItem } from "@/types/database";

export function DailySpecialBanner({ items }: { items: MenuItem[] }) {
  const specials = items.filter((item) => item.is_daily_special && item.is_available);
  if (specials.length === 0) return null;

  return (
    <div className="mx-4 mt-4 rounded-2xl bg-[var(--color-primary)]/10 p-4 sm:mx-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
        Suggestion du chef
      </p>
      <ul className="mt-2 space-y-1">
        {specials.map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-4 text-sm">
            <span className="font-medium text-black/80">{item.name}</span>
            <span className="font-semibold text-[var(--color-primary)]">{item.price.toFixed(2)} €</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
