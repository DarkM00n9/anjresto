"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { menuItemSchema, type MenuItemInput, type MenuItemFormInput } from "@/lib/schemas";
import type { Allergen, Category, MenuItem } from "@/types/database";
import { PhotoUploadField } from "./PhotoUploadField";
import { BadgeCheckboxGroup } from "./BadgeCheckboxGroup";
import { AllergenCheckboxGroup } from "./AllergenCheckboxGroup";
import { createMenuItem, updateMenuItem, deleteMenuItem } from "@/app/admin/actions/menu-items";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";

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
    control,
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

  const photoUrl = useWatch({ control, name: "photo_url" });
  const allergens = useWatch({ control, name: "allergens" });
  const badgeValues = {
    is_vegetarian: useWatch({ control, name: "is_vegetarian" }),
    is_vegan: useWatch({ control, name: "is_vegan" }),
    is_gluten_free: useWatch({ control, name: "is_gluten_free" }),
    is_spicy: useWatch({ control, name: "is_spicy" }),
    is_homemade: useWatch({ control, name: "is_homemade" }),
  };

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
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-3xl space-y-5 pb-8">
      <Card className="space-y-6 sm:p-7">
        <PhotoUploadField
          restaurantId={restaurantId}
          folder="menu-items"
          value={photoUrl ?? ""}
          onChange={(url) => setValue("photo_url", url)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Select id="menu-category" label="Catégorie" {...register("category_id")} error={errors.category_id?.message}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input id="menu-price" label="Prix (€)" type="number" step="0.10" inputMode="decimal" {...register("price")} error={errors.price?.message} />
        </div>

        <Input id="menu-name" label="Nom du plat" {...register("name")} placeholder="Ex : Soupe au pistou" error={errors.name?.message} />
        <Textarea id="menu-description" label="Description" rows={3} {...register("description")} placeholder="Ingrédients, préparation..." hint="Une description courte aide les clients à choisir." />

        <div className="border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold text-slate-900">Régimes et particularités</h2>
          <p className="mt-1 text-sm text-slate-700">Ces repères seront visibles sur la carte en ligne.</p>
          <div className="mt-4">
            <BadgeCheckboxGroup
              value={badgeValues}
              onChange={(key, next) => setValue(key, next)}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold text-slate-900">Allergènes</h2>
          <p className="mt-1 text-sm text-slate-700">Sélectionne ceux présents dans ce plat.</p>
          <div className="mt-4">
            <AllergenCheckboxGroup value={allergens as Allergen[]} onChange={(next) => setValue("allergens", next)} />
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <Toggle {...register("is_daily_special")} label="Suggestion du chef" />
          <p className="mt-1.5 text-xs leading-5 text-amber-800">Le plat sera mis en avant dans la section des suggestions de la carte.</p>
        </div>
      </Card>

      {serverError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button type="submit" variant="accent" size="lg" loading={isPending} className="w-full sm:flex-1">
          {item ? "Enregistrer les modifications" : "Ajouter le plat"}
        </Button>
        {item && <Button type="button" variant="danger" size="md" disabled={isPending} onClick={handleDelete} className="w-full sm:w-auto">Supprimer ce plat</Button>}
      </div>
    </form>
  );
}
