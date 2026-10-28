"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { restaurantInfoSchema, type RestaurantInfoInput } from "@/lib/schemas";
import { requireAdminContext } from "./guard";

export async function updateRestaurantInfo(input: RestaurantInfoInput) {
  const { restaurant } = await requireAdminContext();
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
    })
    .eq("id", restaurant.id);

  revalidatePath("/");
  revalidatePath("/carte");
  revalidatePath("/mentions-legales");
}
