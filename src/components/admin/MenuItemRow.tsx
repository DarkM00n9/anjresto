"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { MenuItem } from "@/types/database";
import { toggleMenuItemAvailability, duplicateMenuItem } from "@/app/admin/actions/menu-items";

export function MenuItemRow({ item, onDuplicated }: { item: MenuItem; onDuplicated: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const [available, setAvailable] = useState(item.is_available);
  const [isPending, startTransition] = useTransition();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleToggle() {
    const next = !available;
    setAvailable(next); // optimiste : doit réagir instantanément
    startTransition(async () => {
      await toggleMenuItemAvailability(item.id, next);
    });
  }

  function handleDuplicate() {
    startTransition(async () => {
      await duplicateMenuItem(item.id);
      onDuplicated();
    });
  }

  return (
    <li ref={setNodeRef} style={style} className={`flex items-center gap-2 py-2.5 ${!available ? "opacity-50" : ""}`}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none px-1 text-lg text-neutral-400"
        aria-label="Réordonner le plat"
      >
        ⠿
      </button>

      <Link href={`/admin/carte/plats/${item.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
        <p className="text-xs text-neutral-500">{item.price.toFixed(2)} €</p>
      </Link>

      <button
        type="button"
        onClick={handleDuplicate}
        disabled={isPending}
        className="px-2 text-lg text-neutral-400"
        aria-label="Dupliquer le plat"
      >
        ⧉
      </button>

      <button
        type="button"
        onClick={handleToggle}
        className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${
          available ? "bg-neutral-100 text-neutral-600" : "bg-red-100 text-red-700"
        }`}
      >
        {available ? "Épuisé ?" : "Épuisé"}
      </button>
    </li>
  );
}
