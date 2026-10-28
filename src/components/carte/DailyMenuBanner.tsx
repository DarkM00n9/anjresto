import type { DailyMenu } from "@/types/database";

export function DailyMenuBanner({ dailyMenu }: { dailyMenu: DailyMenu | null }) {
  if (!dailyMenu) return null;

  const courses = [dailyMenu.starter, dailyMenu.main, dailyMenu.dessert].filter(Boolean);

  return (
    <div className="mx-4 mt-4 rounded-2xl bg-[var(--color-secondary)]/10 p-4 sm:mx-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
          {dailyMenu.title}
        </p>
        <span className="font-semibold text-[var(--color-secondary)]">{dailyMenu.price.toFixed(2)} €</span>
      </div>
      {courses.length > 0 && <p className="mt-1 text-sm text-black/70">{courses.join(" · ")}</p>}
    </div>
  );
}
