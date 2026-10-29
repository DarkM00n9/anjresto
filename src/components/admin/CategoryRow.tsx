"use client";

import { useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
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
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 border-b border-slate-200 pb-3">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-11 w-11 shrink-0 touch-none items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-700"
        aria-label={`Réordonner la catégorie ${category.name}`}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {editing ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className="min-h-10 flex-1 rounded-lg border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-base font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex-1 rounded-lg px-2 py-2 text-left text-base font-semibold text-slate-900 transition-colors hover:bg-slate-100"
        >
          {category.name}
        </button>
      )}

      <IconButton
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        tone="danger"
        className="h-11 w-11 sm:h-9 sm:w-9"
        aria-label={`Supprimer la catégorie ${category.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
