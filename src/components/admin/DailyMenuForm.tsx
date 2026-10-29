"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { dailyMenuSchema, type DailyMenuInput, type DailyMenuFormInput } from "@/lib/schemas";
import type { DailyMenu } from "@/types/database";
import { todayInParis } from "@/lib/closures";
import { upsertDailyMenu, deleteDailyMenu } from "@/app/admin/actions/daily-menu";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";

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
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-3xl space-y-5">
      <Card className="space-y-5 sm:p-7">
        <p className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm leading-6 text-indigo-900">
          Ce menu est affiché uniquement pour aujourd’hui et se désactive automatiquement à minuit.
        </p>

        <div className="flex items-center justify-between rounded-xl border border-slate-300 px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-slate-900">Actif aujourd’hui</p>
            <p className="mt-0.5 text-xs text-slate-700">Affiche ce menu sur le site public.</p>
          </div>
          <Toggle {...register("is_active")} aria-label="Activer le menu du jour" />
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_11rem]">
          <Input id="daily-title" label="Titre" {...register("title")} error={errors.title?.message} />
          <Input id="daily-price" label="Prix (€)" type="number" step="0.10" inputMode="decimal" {...register("price")} error={errors.price?.message} />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Input id="daily-starter" label="Entrée" {...register("starter")} placeholder="Soupe du marché" />
          <Input id="daily-main" label="Plat" {...register("main")} placeholder="Plat du jour" />
          <Input id="daily-dessert" label="Dessert" {...register("dessert")} placeholder="Dessert maison" />
        </div>
      </Card>

      {serverError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button type="submit" variant="accent" size="lg" loading={isPending} className="w-full sm:flex-1">Enregistrer le menu</Button>
        {dailyMenu && <Button type="button" variant="danger" disabled={isPending} onClick={handleDelete} className="w-full sm:w-auto">Supprimer le menu</Button>}
      </div>
    </form>
  );
}
