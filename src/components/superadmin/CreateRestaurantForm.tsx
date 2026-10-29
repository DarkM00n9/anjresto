"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createRestaurantSchema, type CreateRestaurantInput } from "@/lib/schemas";
import { PhotoUploadField } from "@/components/admin/PhotoUploadField";
import { createRestaurant } from "@/app/superadmin/actions/restaurants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const LAYOUT_STYLES = [
  { value: "bistrot_chaleureux", label: "Bistrot chaleureux" },
  { value: "moderne_epure", label: "Moderne épuré" },
  { value: "mediterraneen", label: "Méditerranéen" },
  { value: "diagonale", label: "Moderne diagonale" },
] as const;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateRestaurantForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const restaurantId = useMemo(() => crypto.randomUUID(), []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateRestaurantInput>({
    resolver: zodResolver(createRestaurantSchema),
    defaultValues: {
      id: restaurantId,
      name: "",
      slug: "",
      owner_email: "",
      layout_style: "bistrot_chaleureux",
      primary_color: "#C8553D",
      secondary_color: "#2E4057",
      logo_url: "",
    },
  });

  const logoUrl = useWatch({ control, name: "logo_url" });

  function onSubmit(data: CreateRestaurantInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createRestaurant(data);
      if (result.success) {
        router.push(`/superadmin/${result.restaurantId}`);
      } else {
        setServerError(result.error ?? "Une erreur est survenue.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card className="space-y-5 sm:p-7">
        <section>
          <h2 className="text-sm font-semibold text-slate-900">Établissement</h2>
          <p className="mt-1 text-sm text-slate-700">Renseigne le nom, l’adresse du site et le contact principal.</p>
          <div className="mt-4 space-y-5">
            <PhotoUploadField restaurantId={restaurantId} folder="restaurant" label="Logo (optionnel)" value={logoUrl ?? ""} onChange={(url) => setValue("logo_url", url)} />
            <Input id="new-restaurant-name" label="Nom du restaurant" {...register("name", { onChange: (e) => { if (!slugTouched) setValue("slug", slugify(e.target.value)); } })} error={errors.name?.message} />
            <Input id="new-restaurant-slug" label="Slug du site" {...register("slug", { onChange: (e) => { setSlugTouched(true); const cleaned = slugify(e.target.value); if (cleaned !== e.target.value) setValue("slug", cleaned); } })} hint="Utilisé comme identifiant du sous-domaine." error={errors.slug?.message} />
            <Input id="new-restaurant-owner" type="email" label="Email du restaurateur" {...register("owner_email")} error={errors.owner_email?.message} />
          </div>
        </section>
        <section className="border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold text-slate-900">Apparence du site</h2>
          <div className="mt-4 space-y-5">
            <Select id="new-restaurant-layout" label="Style de mise en page" {...register("layout_style")}>
              {LAYOUT_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Couleur principale<input type="color" {...register("primary_color")} className="mt-1.5 h-12 w-full cursor-pointer rounded-xl border border-slate-300 bg-white p-1.5" /></label>
              <label className="block text-sm font-semibold text-slate-700">Couleur secondaire<input type="color" {...register("secondary_color")} className="mt-1.5 h-12 w-full cursor-pointer rounded-xl border border-slate-300 bg-white p-1.5" /></label>
            </div>
          </div>
        </section>
      </Card>

      {serverError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

      <Button type="submit" variant="accent" size="lg" loading={isPending} className="w-full">Créer le restaurant</Button>
    </form>
  );
}
