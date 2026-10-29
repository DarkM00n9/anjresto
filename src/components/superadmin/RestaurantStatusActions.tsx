"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { RestaurantStatus } from "@/types/database";
import { updateRestaurantStatus } from "@/app/superadmin/actions/restaurants";
import { Card } from "@/components/ui/Card";

const OPTIONS: { value: RestaurantStatus; label: string }[] = [
  { value: "demo", label: "Démo" },
  { value: "active", label: "Actif" },
  { value: "suspended", label: "Suspendu" },
];

export function RestaurantStatusActions({
  restaurantId,
  status,
}: {
  restaurantId: string;
  status: RestaurantStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(next: RestaurantStatus) {
    startTransition(async () => {
      await updateRestaurantStatus(restaurantId, next);
      router.refresh();
    });
  }

  return (
    <Card className="grid grid-cols-3 gap-2 p-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={isPending || status === option.value}
          onClick={() => setStatus(option.value)}
          aria-pressed={status === option.value}
          className={`min-h-10 rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            status === option.value ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          {option.label}
        </button>
      ))}
    </Card>
  );
}
