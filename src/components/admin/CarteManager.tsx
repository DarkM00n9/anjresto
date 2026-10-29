"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
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
import { AdminPage, AdminPageHeader } from "./AdminPage";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Plus, UtensilsCrossed } from "lucide-react";

interface CarteManagerProps {
  categories: Category[];
  items: MenuItem[];
}

export function CarteManager({ categories: initialCategories, items: initialItems }: CarteManagerProps) {
  const router = useRouter();
  const dragContextId = useId();
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

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const next = arrayMove(categories, oldIndex, newIndex);
    setCategories(next);
    void reorderCategories(next.map((c) => c.id));
  }

  function handleItemDragEnd(categoryId: string, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const categoryItems = items.filter((i) => i.category_id === categoryId);
    const otherItems = items.filter((i) => i.category_id !== categoryId);
    const oldIndex = categoryItems.findIndex((i) => i.id === active.id);
    const newIndex = categoryItems.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(categoryItems, oldIndex, newIndex);
    setItems([...otherItems, ...reordered]);
    void reorderMenuItems(reordered.map((i) => i.id));
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Ma carte"
        description="Organise les catégories et garde tes plats à jour en quelques clics."
        action={<ButtonLink href="/admin/carte/plats/nouveau" variant="accent" icon={<Plus className="h-4 w-4" />}>Ajouter un plat</ButtonLink>}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
          {categories.length} {categories.length === 1 ? "catégorie" : "catégories"}
        </span>
        <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
          {items.length} {items.length === 1 ? "plat" : "plats"}
        </span>
      </div>

      {categories.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <UtensilsCrossed className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-slate-900">Ta carte commence ici</h2>
          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-700">Crée une première catégorie comme Entrées, Plats ou Desserts, puis ajoute tes spécialités.</p>
        </Card>
      ) : (
        <DndContext id={`${dragContextId}-categories`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="mt-4 flex flex-col gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="p-3 sm:p-4">
                  <CategoryRow category={category} onDeleted={() => router.refresh()} />

                  <DndContext
                    id={`${dragContextId}-items-${category.id}`}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleItemDragEnd(category.id, e)}
                  >
                    <SortableContext
                      items={items.filter((i) => i.category_id === category.id).map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ul className="mt-1 divide-y divide-slate-200">
                        {items
                          .filter((i) => i.category_id === category.id)
                          .map((item) => (
                            <MenuItemRow key={item.id} item={item} onDuplicated={() => router.refresh()} />
                          ))}
                      </ul>
                    </SortableContext>
                  </DndContext>

                  {items.filter((i) => i.category_id === category.id).length === 0 && (
                    <p className="px-1 py-2 text-xs text-slate-700">Aucun plat dans cette catégorie.</p>
                  )}
                </Card>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AddCategoryForm onCreated={() => router.refresh()} />
    </AdminPage>
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
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 py-4 text-sm font-semibold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
      >
        <Plus className="h-4 w-4" />
        Nouvelle catégorie
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 rounded-2xl border border-slate-300 bg-white p-3 shadow-sm sm:flex-row">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom de la catégorie"
        className="min-h-11 flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
      />
      <Button type="submit" variant="accent" size="md" loading={isPending}>
        Ajouter
      </Button>
    </form>
  );
}
