import Image from "next/image";
import type { Restaurant } from "@/types/database";
import type { LayoutPreset } from "@/lib/layout-presets";
import { ButtonLink } from "@/components/ui/Button";

interface HeroProps {
  restaurant: Restaurant;
  preset: LayoutPreset;
}

export function Hero({ restaurant, preset }: HeroProps) {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden text-white">
      {restaurant.cover_image_url ? (
        <Image
          src={restaurant.cover_image_url}
          alt={restaurant.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--color-secondary)]" />
      )}
      <div className={`absolute inset-0 ${preset.heroOverlay}`} />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        {restaurant.logo_url && (
          <Image
            src={restaurant.logo_url}
            alt={`Logo ${restaurant.name}`}
            width={88}
            height={88}
            className="h-22 w-22 rounded-full border-2 border-white/80 object-cover"
          />
        )}
        <h1 className="font-[family-name:var(--font-title)] text-4xl font-bold sm:text-5xl md:text-6xl">
          {restaurant.name}
        </h1>
        {restaurant.tagline && (
          <p className="max-w-xl text-lg text-white/90 sm:text-xl">{restaurant.tagline}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <ButtonLink href="#contact">Réserver une table</ButtonLink>
          <ButtonLink href="/carte" variant="outline-white">
            Voir la carte
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
