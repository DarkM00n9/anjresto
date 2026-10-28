"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { Category, MenuItem } from "@/types/database";
import { CategoryRow } from "./CategoryRow";
import { MenuItemRow } from "./MenuItemRow";
import { reorderCategories, createCategory } from "@/app/admin/actions/categories";
import { reorderMenuItems } from "@/app/admin/actions/menu-items";

interface CarteManagerProps {
  categories: Category[];
  items: MenuItem[];
}

export function CarteManager({ categories: initialCategories, items: initialItems }: CarteManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);

  // Resynchronise l'état local quand le serveur renvoie des props fraîches
  // (après un router.refresh()), sans passer par un effect.
  const [prevInitialCategories, setPrevInitialCategories] = useState(initialCategories);
  if (initialCategories !== prevInitialCategories) {
    setPrevInitialCategories(initialCategories);
    setCategories(initialCategories);
  }

  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);
  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems);
    setItems(initialItems);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories((current) => {
      const oldIndex = current.findIndex((c) => c.id === active.id);
      const newIndex = current.findIndex((c) => c.id === over.id);
      const next = arrayMove(current, oldIndex, newIndex);
      reorderCategories(next.map((c) => c.id));
      return next;
    });
  }

  function handleItemDragEnd(categoryId: string, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const categoryItems = current.filter((i) => i.category_id === categoryId);
      const otherItems = current.filter((i) => i.category_id !== categoryId);
      const oldIndex = categoryItems.findIndex((i) => i.id === active.id);
      const newIndex = categoryItems.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(categoryItems, oldIndex, newIndex);
      reorderMenuItems(reordered.map((i) => i.id));
      return [...otherItems, ...reordered];
    });
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Ma carte</h1>
        <Link
          href="/admin/carte/plats/nouveau"
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
        >
          + Plat
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Commence par créer une catégorie (ex : Entrées, Plats, Desserts).
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="mt-4 flex flex-col gap-4">
              {categories.map((category) => (
                <div key={category.id} className="rounded-2xl bg-white p-3 shadow-sm">
                  <CategoryRow category={category} onDeleted={() => router.refresh()} />

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleItemDragEnd(category.id, e)}
                  >
                    <SortableContext
                      items={items.filter((i) => i.category_id === category.id).map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ul className="mt-1 divide-y divide-neutral-100">
                        {items
                          .filter((i) => i.category_id === category.id)
                          .map((item) => (
                            <MenuItemRow key={item.id} item={item} onDuplicated={() => router.refresh()} />
                          ))}
                      </ul>
                    </SortableContext>
                  </DndContext>

                  {items.filter((i) => i.category_id === category.id).length === 0 && (
                    <p className="px-1 py-2 text-xs text-neutral-400">Aucun plat dans cette catégorie.</p>
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AddCategoryForm onCreated={() => router.refresh()} />
    </div>
  );
}

function AddCategoryForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      await createCategory({ name, description: "" });
      setName("");
      setOpen(false);
      onCreated();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 w-full rounded-2xl border-2 border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-500"
      >
        + Nouvelle catégorie
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom de la catégorie"
        className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-base"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        Ajouter
      </button>
    </form>
  );
}
