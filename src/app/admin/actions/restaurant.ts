"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { restaurantInfoSchema, type RestaurantInfoInput } from "@/lib/schemas";
import { requireAdminContext } from "./guard";
import { OWNER_ONLY } from "@/lib/permissions";

export async function updateRestaurantInfo(input: RestaurantInfoInput) {
  const { restaurant } = await requireAdminContext(OWNER_ONLY);
  const data = restaurantInfoSchema.parse(input);
  const supabase = await createClient();

  await supabase
    .from("restaurants")
    .update({
      name: data.name,
      tagline: data.tagline || null,
      description: data.description || null,
      phone: data.phone || null,
      email: data.email || null,
      address_line: data.address_line || null,
      postal_code: data.postal_code || null,
      city: data.city || null,
      instagram_url: data.instagram_url || null,
      facebook_url: data.facebook_url || null,
      logo_url: data.logo_url || null,
      cover_image_url: data.cover_image_url || null,
      gallery_urls: data.gallery_urls,
      google_reviews_url: data.google_reviews_url || null,
      google_rating: data.google_rating ? Math.min(5, Math.max(0, Number(data.google_rating.replace(",", ".")) || 0)) : null,
      google_reviews_count: data.google_reviews_count ? Math.max(0, Math.round(Number(data.google_reviews_count) || 0)) : null,
    })
    .eq("id", restaurant.id);

  revalidatePath("/");
  revalidatePath("/carte");
  revalidatePath("/mentions-legales");
}
