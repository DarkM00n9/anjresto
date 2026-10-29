"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { restaurantInfoSchema, type RestaurantInfoInput } from "@/lib/schemas";
import type { Restaurant } from "@/types/database";
import { PhotoUploadField } from "./PhotoUploadField";
import { updateRestaurantInfo } from "@/app/admin/actions/restaurant";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Trash2 } from "lucide-react";

export function RestaurantInfoForm({ restaurant }: { restaurant: Restaurant }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RestaurantInfoInput>({
    resolver: zodResolver(restaurantInfoSchema),
    defaultValues: {
      name: restaurant.name,
      tagline: restaurant.tagline ?? "",
      description: restaurant.description ?? "",
      phone: restaurant.phone ?? "",
      email: restaurant.email ?? "",
      address_line: restaurant.address_line ?? "",
      postal_code: restaurant.postal_code ?? "",
      city: restaurant.city ?? "",
      instagram_url: restaurant.instagram_url ?? "",
      facebook_url: restaurant.facebook_url ?? "",
      logo_url: restaurant.logo_url ?? "",
      cover_image_url: restaurant.cover_image_url ?? "",
      gallery_urls: restaurant.gallery_urls ?? [],
      google_reviews_url: restaurant.google_reviews_url ?? "",
      google_rating: restaurant.google_rating?.toString() ?? "",
      google_reviews_count: restaurant.google_reviews_count?.toString() ?? "",
    },
  });

  const logoUrl = useWatch({ control, name: "logo_url" });
  const coverUrl = useWatch({ control, name: "cover_image_url" });
  const galleryUrls = useWatch({ control, name: "gallery_urls" }) ?? [];

  function onSubmit(data: RestaurantInfoInput) {
    setSaved(false);
    startTransition(async () => {
      await updateRestaurantInfo(data);
      setSaved(true);
    });
  }

  function addGalleryPhoto(url: string) {
    if (!url || galleryUrls.length >= 4) return;
    setValue("gallery_urls", [...galleryUrls, url]);
  }

  function removeGalleryPhoto(index: number) {
    setValue(
      "gallery_urls",
      galleryUrls.filter((_, i) => i !== index),
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-3xl space-y-5">
      <Card className="space-y-6 sm:p-7">
        <section>
          <h2 className="text-sm font-semibold text-slate-900">Identité visuelle</h2>
          <p className="mt-1 text-sm text-slate-700">Choisis les images qui représentent ton établissement.</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <PhotoUploadField restaurantId={restaurant.id} folder="restaurant" label="Logo" value={logoUrl ?? ""} onChange={(url) => setValue("logo_url", url)} />
            <PhotoUploadField restaurantId={restaurant.id} folder="restaurant" label="Photo de couverture" value={coverUrl ?? ""} onChange={(url) => setValue("cover_image_url", url)} />
          </div>
        </section>

        <section className="border-t border-slate-200 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Galerie du restaurant</h2>
              <p className="mt-1 text-sm text-slate-700">Jusqu’à 4 photos pour la section « À propos ».</p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">{galleryUrls.length}/4</span>
          </div>
          {galleryUrls.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {galleryUrls.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-200">
                <Image src={url} alt={`Photo ${i + 1} du restaurant`} fill className="object-cover transition-transform group-hover:scale-105" sizes="160px" />
                <button type="button" onClick={() => removeGalleryPhoto(i)} aria-label={`Retirer la photo ${i + 1}`} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>}
          {galleryUrls.length < 4 && <div className="mt-4"><PhotoUploadField restaurantId={restaurant.id} folder="restaurant" label="Ajouter une photo" value="" onChange={addGalleryPhoto} /></div>}
        </section>
      </Card>

      <Card className="space-y-5 sm:p-7">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Présentation</h2>
          <p className="mt-1 text-sm text-slate-700">Présente ton restaurant et son univers.</p>
        </div>
        <Input id="restaurant-name" label="Nom du restaurant" {...register("name")} error={errors.name?.message} />
        <Input id="restaurant-tagline" label="Accroche" {...register("tagline")} placeholder="Ex. Cuisine provençale, produits du marché" />
        <Textarea id="restaurant-description" label="À propos" {...register("description")} rows={4} hint="Quelques phrases sur ta cuisine, ton histoire ou tes produits." />
      </Card>

      <Card className="space-y-5 sm:p-7">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Coordonnées</h2>
          <p className="mt-1 text-sm text-slate-700">Aide les clients à te contacter et à te trouver.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input id="restaurant-phone" label="Téléphone" type="tel" {...register("phone")} />
          <Input id="restaurant-email" label="Email" type="email" {...register("email")} error={errors.email?.message} />
        </div>
        <Input id="restaurant-address" label="Adresse" {...register("address_line")} placeholder="N° et rue" />
        <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
          <Input id="restaurant-postal-code" label="Code postal" {...register("postal_code")} />
          <Input id="restaurant-city" label="Ville" {...register("city")} />
        </div>
      </Card>

      <Card className="space-y-5 sm:p-7">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Réseaux sociaux</h2>
          <p className="mt-1 text-sm text-slate-700">Les liens renseignés seront affichés sur ton site.</p>
        </div>
        <Input id="restaurant-instagram" label="Instagram" type="url" {...register("instagram_url")} placeholder="https://instagram.com/..." />
        <Input id="restaurant-facebook" label="Facebook" type="url" {...register("facebook_url")} placeholder="https://facebook.com/..." />
        <Input id="restaurant-google-url" label="Lien de votre fiche Google (avis)" type="url" {...register("google_reviews_url")} placeholder="https://g.page/..." />
        <div className="grid grid-cols-2 gap-3">
          <Input id="restaurant-google-rating" label="Note Google (ex : 4.7)" {...register("google_rating")} />
          <Input id="restaurant-google-count" label="Nombre d’avis" {...register("google_reviews_count")} />
        </div>
      </Card>

      <Button type="submit" variant="accent" size="lg" loading={isPending} className="w-full">
        {saved ? "Modifications enregistrées" : "Enregistrer les informations"}
      </Button>
    </form>
  );
}
