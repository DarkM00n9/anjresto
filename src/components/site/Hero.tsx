import Image from "next/image";
import type { Restaurant } from "@/types/database";
import type { LayoutPreset } from "@/lib/layout-presets";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowDown, MapPin } from "lucide-react";
import { GoogleReviews } from "./GoogleReviews";
import { getT, getLocalize } from "@/lib/lang";


interface HeroProps {
  restaurant: Restaurant;
  preset: LayoutPreset;
}

export async function Hero({ restaurant, preset }: HeroProps) {
  const t = await getT();
  const L = await getLocalize();
  return (
    <section className="relative isolate flex min-h-[min(900px,calc(100svh-64px))] items-center justify-center overflow-hidden text-white">
      {restaurant.cover_image_url ? (
        <Image
          src={restaurant.cover_image_url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-bg hero-parallax object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--color-secondary)]" />
      )}
      <div className={`absolute inset-0 ${preset.heroOverlay}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 py-24 text-center sm:gap-7 sm:px-8">
        {restaurant.city && (
          <p style={{ "--enter-delay": "200ms" } as React.CSSProperties} className="hero-enter inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85">
            <span className="h-px w-8 bg-white/60" />
            <MapPin className="h-3.5 w-3.5" />
            {restaurant.city}
            <span className="h-px w-8 bg-white/60" />
          </p>
        )}
        {restaurant.logo_url && (
          <Image
            style={{ "--enter-delay": "350ms" } as React.CSSProperties} 
            src={restaurant.logo_url}
            alt={`Logo ${restaurant.name}`}
            width={80}
            height={80}
            className="hero-enter h-[4.5rem] w-[4.5rem] rounded-full border border-white/80 object-cover shadow-xl shadow-black/25 sm:h-20 sm:w-20"
          />
        )}
        <h1 style={{ "--enter-delay": "500ms" } as React.CSSProperties} className="hero-enter max-w-5xl font-[family-name:var(--font-title)] text-6xl font-normal leading-[0.98] tracking-[-0.045em] drop-shadow-sm sm:text-7xl md:text-8xl">
          {restaurant.name}
        </h1>
        {restaurant.tagline && (
          <p style={{ "--enter-delay": "700ms" } as React.CSSProperties} className="hero-enter max-w-2xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">{L(restaurant.tagline, restaurant.tagline_en)}</p>
        )}
        <div style={{ "--enter-delay": "800ms" } as React.CSSProperties} className="hero-enter">
          <GoogleReviews restaurant={restaurant} />
        </div>
        <div style={{ "--enter-delay": "900ms" } as React.CSSProperties} className="hero-enter flex flex-wrap items-center justify-center gap-3 pt-2">
          <ButtonLink href="/reservation" size="lg" className="min-w-48">{t("Réserver une table")}</ButtonLink>
          <ButtonLink href="/carte" variant="outline-white" size="lg">
            {t("Voir la carte")}
          </ButtonLink>
        </div>
        <a href="#histoire" style={{ "--enter-delay": "1200ms" } as React.CSSProperties} className="hero-enter mt-12 inline-flex flex-col items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75 transition-colors hover:text-white">
          {t("Découvrir la maison")} <ArrowDown className="hero-bob h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
