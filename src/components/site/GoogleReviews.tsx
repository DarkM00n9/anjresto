import { Star } from "lucide-react";
import type { Restaurant } from "@/types/database";
import { getT } from "@/lib/lang";


function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

/** Pastille de note Google, affichée dans le hero : réassurance immédiate. */
export async function GoogleReviews({ restaurant }: { restaurant: Restaurant }) {
  if (!restaurant.google_rating) return null;
  const t = await getT();

  const rating = Number(restaurant.google_rating);

  const pill = (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/15 py-1.5 pl-2 pr-4 text-sm text-white shadow-lg shadow-black/20 backdrop-blur-md transition-colors hover:bg-white/25">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
        <GoogleG />
      </span>
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span className="flex text-amber-400" aria-label={`Note ${rating} sur 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className="h-3.5 w-3.5" fill={n <= Math.round(rating) ? "currentColor" : "none"} />
        ))}
      </span>
      {restaurant.google_reviews_count ? <span className="text-white/85">· {restaurant.google_reviews_count} {t("avis")}</span> : null}
    </span>
  );

  return restaurant.google_reviews_url ? (
    <a href={restaurant.google_reviews_url} target="_blank" rel="noopener noreferrer" aria-label="Lire les avis Google">
      {pill}
    </a>
  ) : (
    pill
  );
}
