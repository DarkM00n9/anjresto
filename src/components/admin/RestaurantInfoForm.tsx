"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { restaurantInfoSchema, type RestaurantInfoInput } from "@/lib/schemas";
import type { Restaurant } from "@/types/database";
import { PhotoUploadField } from "./PhotoUploadField";
import { updateRestaurantInfo } from "@/app/admin/actions/restaurant";

export function RestaurantInfoForm({ restaurant }: { restaurant: Restaurant }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
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
    },
  });

  const logoUrl = watch("logo_url");
  const coverUrl = watch("cover_image_url");
  const galleryUrls = watch("gallery_urls");

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-4 py-6 sm:px-6">
      <PhotoUploadField
        restaurantId={restaurant.id}
        folder="restaurant"
        label="Logo"
        value={logoUrl ?? ""}
        onChange={(url) => setValue("logo_url", url)}
      />
      <PhotoUploadField
        restaurantId={restaurant.id}
        folder="restaurant"
        label="Photo de couverture"
        value={coverUrl ?? ""}
        onChange={(url) => setValue("cover_image_url", url)}
      />

      <div>
        <p className="text-sm font-medium text-neutral-700">Photos &quot;À propos&quot; ({galleryUrls.length}/4)</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {galleryUrls.map((url, i) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => removeGalleryPhoto(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {galleryUrls.length < 4 && (
          <div className="mt-2">
            <PhotoUploadField
              restaurantId={restaurant.id}
              folder="restaurant"
              label="Ajouter une photo"
              value=""
              onChange={addGalleryPhoto}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Nom du restaurant</label>
        <input
          {...register("name")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Accroche</label>
        <input
          {...register("tagline")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
          placeholder="Ex : Cuisine provençale, produits du marché"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">À propos</label>
        <textarea
          {...register("description")}
          rows={4}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Téléphone</label>
        <input
          {...register("phone")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input
          {...register("email")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Adresse</label>
        <input
          {...register("address_line")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
          placeholder="N° et rue"
        />
        <div className="mt-2 flex gap-2">
          <input
            {...register("postal_code")}
            className="w-28 rounded-xl border border-neutral-300 px-4 py-3 text-base"
            placeholder="Code postal"
          />
          <input
            {...register("city")}
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-base"
            placeholder="Ville"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Instagram</label>
        <input
          {...register("instagram_url")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
          placeholder="https://instagram.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Facebook</label>
        <input
          {...register("facebook_url")}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base"
          placeholder="https://facebook.com/..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-neutral-900 px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Enregistrement..." : saved ? "Enregistré ✓" : "Enregistrer"}
      </button>
    </form>
  );
}
