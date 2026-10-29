import Image from "next/image";
import type { Restaurant } from "@/types/database";
import { Section } from "@/components/ui/Section";
import type { LayoutPreset } from "@/lib/layout-presets";

interface AboutProps {
  restaurant: Restaurant;
  preset: LayoutPreset;
}

export function About({ restaurant, preset }: AboutProps) {
  if (!restaurant.description && restaurant.gallery_urls.length === 0) return null;
  const imageKey = (url: string) => {
    try {
      const imageUrl = new URL(url);
      return `${imageUrl.origin}${imageUrl.pathname}`;
    } catch {
      return url.split(/[?#]/, 1)[0];
    }
  };
  const coverKey = restaurant.cover_image_url ? imageKey(restaurant.cover_image_url) : null;
  const distinctImages = restaurant.gallery_urls.filter((url) => imageKey(url) !== coverKey);
  const images = (distinctImages.length > 0 ? distinctImages : restaurant.gallery_urls).slice(0, 3);

  return (
    <Section id="histoire" spacing="py-20 md:py-32" className="bg-stone-200">
      <div className={`grid gap-12 ${images.length ? "md:grid-cols-[0.78fr_1.22fr] md:items-center md:gap-16" : "md:max-w-3xl"}`}>
        <div className="py-2">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            <span className="h-px w-8 bg-[var(--color-primary)]" />Notre histoire
          </p>
          <h2 className="mt-6 font-[family-name:var(--font-title)] text-4xl font-normal leading-[1.05] tracking-[-0.035em] text-[var(--color-secondary)] sm:text-5xl lg:text-6xl">
            L’esprit de la maison
          </h2>
          {restaurant.description && (
            <p className="mt-7 max-w-xl whitespace-pre-line border-l border-[var(--color-primary)]/50 pl-5 text-base leading-8 text-stone-700 sm:text-lg sm:leading-8">{restaurant.description}</p>
          )}
          {(restaurant.cuisine_type || restaurant.city) && (
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">
              {[restaurant.cuisine_type, restaurant.city].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:min-h-[520px] md:grid-rows-2">
            {images.map((url, index) => {
              const isOnlyImage = images.length === 1;
              const isMainImage = index === 0;
              const className = isOnlyImage
                ? "col-span-2 aspect-[16/10] md:row-span-2 md:aspect-auto"
                : isMainImage
                  ? "col-span-2 aspect-[16/10] md:col-span-1 md:row-span-2 md:aspect-auto"
                  : `aspect-[4/3] md:aspect-auto ${images.length === 2 ? "md:row-span-2" : ""}`;

              return (
                <div key={url} className={`group relative overflow-hidden ${preset.radius} ${className}`}>
                  <Image
                    src={url}
                    alt={`${restaurant.name} — ${index === 0 ? "la maison" : "en salle"}`}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, 42vw"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
}
