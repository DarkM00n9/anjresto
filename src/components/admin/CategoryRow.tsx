"use client";

import { useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Category } from "@/types/database";
import { updateCategory, deleteCategory } from "@/app/admin/actions/categories";

export function CategoryRow({ category, onDeleted }: { category: Category; onDeleted: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [isPending, startTransition] = useTransition();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleSave() {
    setEditing(false);
    if (!name.trim() || name === category.name) {
      setName(category.name);
      return;
    }
    startTransition(async () => {
      await updateCategory(category.id, { name, description: category.description ?? "" });
    });
  }

  function handleDelete() {
    if (!confirm(`Supprimer la catégorie "${category.name}" et tous ses plats ?`)) return;
    startTransition(async () => {
      await deleteCategory(category.id);
      onDeleted();
    });
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none px-1 text-lg text-neutral-400"
        aria-label="Réordonner la catégorie"
      >
        ⠿
      </button>

      {editing ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className="flex-1 rounded-lg border border-neutral-300 px-2 py-1 text-base font-semibold"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex-1 text-left text-base font-semibold text-neutral-900"
        >
          {category.name}
        </button>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="px-2 text-sm text-red-500"
        aria-label="Supprimer la catégorie"
      >
        ✕
      </button>
    </div>
  );
}
