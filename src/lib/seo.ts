import type { Metadata } from "next";
import type { Category, MenuItem, OpeningHour, Restaurant } from "@/types/database";

export function buildRestaurantMetadata(
  restaurant: Restaurant,
  baseUrl: string,
): Metadata {
  const title = restaurant.tagline
    ? `${restaurant.name} — ${restaurant.tagline}`
    : restaurant.name;
  const description =
    restaurant.description?.slice(0, 160) ??
    `Découvrez ${restaurant.name}, sa carte, ses horaires et comment réserver une table.`;

  return {
    title,
    description,
    robots: restaurant.status === "active" ? undefined : { index: false, follow: false },
    alternates: { canonical: baseUrl },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: restaurant.name,
      type: "website",
      locale: "fr_FR",
      images: restaurant.cover_image_url ? [{ url: restaurant.cover_image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: restaurant.cover_image_url ? [restaurant.cover_image_url] : undefined,
    },
  };
}

const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function buildRestaurantJsonLd(restaurant: Restaurant, baseUrl: string, hours: OpeningHour[] = []) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.description ?? undefined,
    image: restaurant.cover_image_url ?? undefined,
    telephone: restaurant.phone ?? undefined,
    servesCuisine: restaurant.cuisine_type ?? undefined,
    url: baseUrl,
    menu: `${baseUrl}/carte`,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address_line ?? undefined,
      postalCode: restaurant.postal_code ?? undefined,
      addressLocality: restaurant.city ?? undefined,
      addressCountry: "FR",
    },
    geo:
      restaurant.latitude != null && restaurant.longitude != null
        ? {
            "@type": "GeoCoordinates",
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }
        : undefined,
    email: restaurant.email ?? undefined,
    logo: restaurant.logo_url ?? undefined,
    acceptsReservations: `${baseUrl}/reservation`,
    openingHoursSpecification: hours
      .filter((h) => !h.is_closed && h.opens_at && h.closes_at)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SCHEMA_DAYS[h.day_of_week],
        opens: h.opens_at!.slice(0, 5),
        closes: h.closes_at!.slice(0, 5),
      })),
    aggregateRating:
      restaurant.google_rating && restaurant.google_reviews_count
        ? {
            "@type": "AggregateRating",
            ratingValue: restaurant.google_rating,
            reviewCount: restaurant.google_reviews_count,
          }
        : undefined,
    sameAs: [restaurant.instagram_url, restaurant.facebook_url].filter(Boolean),
  };
}

export function buildMenuJsonLd(
  restaurant: Restaurant,
  categories: Category[],
  items: MenuItem[],
  baseUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `Carte — ${restaurant.name}`,
    url: `${baseUrl}/carte`,
    hasMenuSection: categories.map((category) => ({
      "@type": "MenuSection",
      name: category.name,
      hasMenuItem: items
        .filter((item) => item.category_id === category.id && item.is_available)
        .map((item) => ({
          "@type": "MenuItem",
          name: item.name,
          description: item.description ?? undefined,
          offers: {
            "@type": "Offer",
            price: item.price,
            priceCurrency: "EUR",
          },
        })),
    })),
  };
}
