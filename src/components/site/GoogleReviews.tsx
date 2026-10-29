import { Star } from "lucide-react";
import type { Restaurant } from "@/types/database";

/** Bandeau de réassurance : note Google du restaurant, avec lien vers la fiche. */
export function GoogleReviews({ restaurant }: { restaurant: Restaurant }) {
  if (!restaurant.google_rating) return null;
  const rating = Number(restaurant.google_rating);
  const content = (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-4 py-10 text-center">
      <div className="flex items-center gap-1 text-amber-500" aria-label={`Note ${rating} sur 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className="h-6 w-6" fill={n <= Math.round(rating) ? "currentColor" : "none"} />
        ))}
      </div>
      <p className="font-[family-name:var(--font-title)] text-3xl text-[var(--color-secondary)]">{rating.toFixed(1)} / 5</p>
      <p className="text-sm text-stone-700">
        {restaurant.google_reviews_count ? `${restaurant.google_reviews_count} avis Google` : "Avis Google"}
        {restaurant.google_reviews_url && <span className="ml-2 font-semibold text-[var(--color-primary)] underline">Lire les avis</span>}
      </p>
    </div>
  );
  return (
    <section className="border-y border-black/10 bg-stone-200">
      {restaurant.google_reviews_url ? (
        <a href={restaurant.google_reviews_url} target="_blank" rel="noopener noreferrer" className="block transition-colors hover:bg-stone-300/60">
          {content}
        </a>
      ) : (
        content
      )}
    </section>
  );
}
