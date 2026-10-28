"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { dailyMenuSchema, type DailyMenuInput, type DailyMenuFormInput } from "@/lib/schemas";
import type { DailyMenu } from "@/types/database";
import { todayInParis } from "@/lib/closures";
import { upsertDailyMenu, deleteDailyMenu } from "@/app/admin/actions/daily-menu";

export function DailyMenuForm({ dailyMenu }: { dailyMenu: DailyMenu | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DailyMenuFormInput, unknown, DailyMenuInput>({
    resolver: zodResolver(dailyMenuSchema),
    defaultValues: {
      title: dailyMenu?.title ?? "Menu du jour",
      starter: dailyMenu?.starter ?? "",
      main: dailyMenu?.main ?? "",
      dessert: dailyMenu?.dessert ?? "",
      price: dailyMenu?.price ?? 0,
      valid_date: dailyMenu?.valid_date ?? todayInParis(),
      is_active: dailyMenu?.is_active ?? true,
    },
  });

  function onSubmit(data: DailyMenuInput) {
    setServerError(null);
    startTransition(async () => {
      try {
        await upsertDailyMenu(data);
        router.refresh();
      } catch {
        setServerError("Une erreur est survenue. Réessaie.");
      }
    });
  }

  function handleDelete() {
    if (!dailyMenu) return;
    startTransition(async () => {
      await deleteDailyMenu(dailyMenu.id);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-4 py-6 sm:px-6">
      <p className="text-sm text-neutral-500">
        Valable uniquement aujourd&apos;hui — désactivé automatiquement à minuit.
      </p>

      <label className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
        <span className="text-sm font-medium text-neutral-700">Actif aujourd&apos;hui</span>
        <input type="checkbox" {...register("is_active")} className="h-6 w-6 rounded" />
      </label>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Titre</label>
        <input
          {...register("title")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Entrée</label>
        <input
          {...register("starter")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Plat</label>
        <input
          {...register("main")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Dessert</label>
        <input
          {...register("dessert")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
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

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-neutral-900 px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </button>

      {dailyMenu && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600"
        >
          Supprimer le menu du jour
        </button>
      )}
    </form>
  );
}
