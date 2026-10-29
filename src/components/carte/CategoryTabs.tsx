"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/types/database";
import { useT } from "@/components/site/LangProvider";

interface CategoryTabsProps {
  categories: Category[];
}

export function CategoryTabs({ categories }: CategoryTabsProps) {
  const t = useT();
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id.replace("categorie-", ""));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    categories.forEach((category) => {
      const el = document.getElementById(`categorie-${category.id}`);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [categories]);

  function scrollTo(id: string) {
    document.getElementById(`categorie-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (categories.length === 0) return null;

  return (
    <nav aria-label={t("Catégories de la carte")} className="sticky top-[58px] z-20 overflow-x-auto border-b border-black/[0.08] bg-white/95 backdrop-blur-xl sm:top-[61px]">
      <ul className="mx-auto flex min-w-max max-w-7xl gap-7 px-4 sm:gap-9 sm:px-6 lg:px-8">
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => scrollTo(category.id)}
              aria-pressed={activeId === category.id}
              className={`relative whitespace-nowrap py-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:transition-transform ${
                activeId === category.id
                  ? "text-[var(--color-primary)] after:scale-x-100 after:bg-[var(--color-primary)]"
                  : "text-stone-600 after:scale-x-0 after:bg-[var(--color-primary)] hover:text-[var(--color-primary)] hover:after:scale-x-100"
              }`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
