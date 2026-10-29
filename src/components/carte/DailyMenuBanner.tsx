import type { DailyMenu } from "@/types/database";
import { Sun } from "lucide-react";

export function DailyMenuBanner({ dailyMenu }: { dailyMenu: DailyMenu | null }) {
  if (!dailyMenu) return null;

  const courses = [dailyMenu.starter, dailyMenu.main, dailyMenu.dessert].filter(Boolean);

  return (
    <div className="mx-auto mt-5 max-w-4xl px-4 sm:px-6">
      <div className="border-y border-black/10 bg-stone-200 px-5 py-6 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]"><Sun className="h-3.5 w-3.5" />Menu du jour</p>
            <h2 className="mt-2 font-[family-name:var(--font-title)] text-xl font-medium text-[var(--color-secondary)] sm:text-2xl">{dailyMenu.title}</h2>
          </div>
          <span className="whitespace-nowrap pt-1 text-base font-semibold tabular-nums text-[var(--color-primary)] sm:text-lg">{dailyMenu.price.toFixed(2)} €</span>
        </div>
        {courses.length > 0 && <p className="mt-4 border-t border-black/[0.08] pt-3 text-sm leading-6 text-stone-700">{courses.join(" · ")}</p>}
      </div>
    </div>
  );
}
