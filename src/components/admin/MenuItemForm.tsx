"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { menuItemSchema, type MenuItemInput, type MenuItemFormInput } from "@/lib/schemas";
import type { Allergen, Category, MenuItem } from "@/types/database";
import { PhotoUploadField } from "./PhotoUploadField";
import { BadgeCheckboxGroup } from "./BadgeCheckboxGroup";
import { AllergenCheckboxGroup } from "./AllergenCheckboxGroup";
import { createMenuItem, updateMenuItem, deleteMenuItem } from "@/app/admin/actions/menu-items";

interface MenuItemFormProps {
  restaurantId: string;
  categories: Category[];
  item?: MenuItem;
  defaultCategoryId?: string;
}

export function MenuItemForm({ restaurantId, categories, item, defaultCategoryId }: MenuItemFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MenuItemFormInput, unknown, MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      category_id: item?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "",
      name: item?.name ?? "",
      description: item?.description ?? "",
      price: item?.price ?? 0,
      photo_url: item?.photo_url ?? "",
      is_vegetarian: item?.is_vegetarian ?? false,
      is_vegan: item?.is_vegan ?? false,
      is_gluten_free: item?.is_gluten_free ?? false,
      is_spicy: item?.is_spicy ?? false,
      is_homemade: item?.is_homemade ?? false,
      is_daily_special: item?.is_daily_special ?? false,
      allergens: item?.allergens ?? [],
    },
  });

  const photoUrl = watch("photo_url");
  const allergens = watch("allergens");

  function onSubmit(data: MenuItemInput) {
    setServerError(null);
    startTransition(async () => {
      try {
        if (item) {
          await updateMenuItem(item.id, data);
        } else {
          await createMenuItem(data);
        }
        router.push("/admin/carte");
        router.refresh();
      } catch {
        setServerError("Une erreur est survenue. Réessaie.");
      }
    });
  }

  function handleDelete() {
    if (!item) return;
    if (!confirm(`Supprimer "${item.name}" ?`)) return;
    startTransition(async () => {
      await deleteMenuItem(item.id);
      router.push("/admin/carte");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-4 py-6 sm:px-6">
      <PhotoUploadField
        restaurantId={restaurantId}
        folder="menu-items"
        value={photoUrl ?? ""}
        onChange={(url) => setValue("photo_url", url)}
      />

      <div>
        <label className="block text-sm font-medium text-neutral-700">Catégorie</label>
        <select
          {...register("category_id")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category_id && <p className="mt-1 text-xs text-red-600">{errors.category_id.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Nom du plat</label>
        <input
          {...register("name")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
          placeholder="Ex : Soupe au pistou"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Description</label>
        <textarea
          {...register("description")}
          rows={2}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
          placeholder="Ingrédients, préparation..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Prix (€)</label>
        <input
          type="number"
          step="0.10"
          inputMode="decimal"
          {...register("price")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-700">Badges</p>
        <div className="mt-2">
          <BadgeCheckboxGroup
            value={{
              is_vegetarian: watch("is_vegetarian"),
              is_vegan: watch("is_vegan"),
              is_gluten_free: watch("is_gluten_free"),
              is_spicy: watch("is_spicy"),
              is_homemade: watch("is_homemade"),
            }}
            onChange={(key, next) => setValue(key, next)}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-700">Allergènes</p>
        <div className="mt-2">
          <AllergenCheckboxGroup value={allergens as Allergen[]} onChange={(next) => setValue("allergens", next)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
        <input type="checkbox" {...register("is_daily_special")} className="h-5 w-5 rounded" />
        Suggestion du chef (mise en avant sur la carte)
      </label>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-neutral-900 px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Enregistrement..." : item ? "Enregistrer" : "Ajouter le plat"}
      </button>

      {item && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600"
        >
          Supprimer ce plat
        </button>
      )}
    </form>
  );
}
