"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
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
    <li ref={setNodeRef} style={style} className={`grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 rounded-xl px-1 py-3 transition-colors hover:bg-slate-200 sm:flex ${!available ? "opacity-55" : ""}`}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-11 w-11 shrink-0 touch-none items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-700"
        aria-label={`Réordonner le plat ${item.name}`}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <Link href={`/admin/carte/plats/${item.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
        <p className="mt-0.5 text-xs text-slate-700">{item.price.toFixed(2)} €</p>
      </Link>

      <IconButton
        type="button"
        onClick={handleDuplicate}
        disabled={isPending}
        className="h-11 w-11 sm:h-9 sm:w-9"
        aria-label={`Dupliquer ${item.name}`}
      >
        <Copy className="h-4 w-4" />
      </IconButton>

      <button
        type="button"
        onClick={handleToggle}
        className={`col-start-2 col-span-2 min-h-11 justify-self-start rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:col-auto sm:col-span-1 sm:justify-self-auto ${
          available ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
        }`}
        aria-pressed={!available}
      >
        {available ? "Marquer épuisé" : "Épuisé"}
      </button>
    </li>
  );
}
