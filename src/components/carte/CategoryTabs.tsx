"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/types/database";

interface CategoryTabsProps {
  categories: Category[];
}

export function CategoryTabs({ categories }: CategoryTabsProps) {
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
    <nav className="sticky top-0 z-20 overflow-x-auto border-b border-black/5 bg-[var(--background)]/95 backdrop-blur">
      <ul className="flex min-w-max gap-2 px-4 py-3 sm:px-6">
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => scrollTo(category.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeId === category.id
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-black/5 text-black/60"
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
