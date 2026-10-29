import Image from "next/image";
import type { Restaurant } from "@/types/database";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowDown, MapPin } from "lucide-react";
import { GoogleReviews } from "./GoogleReviews";
import { getT, getLocalize } from "@/lib/lang";

/** Hero « Moderne diagonale » : texte à gauche, grande photo ronde à cheval sur une diagonale colorée. */
export async function HeroDiagonal({ restaurant }: { restaurant: Restaurant }) {
  const t = await getT();
  const L = await getLocalize();
  const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as React.CSSProperties;

  return (
    <section className="relative isolate overflow-hidden bg-stone-50">
      {/* Diagonale colorée : à droite sur grand écran, en bas sur mobile. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[var(--color-secondary)] [clip-path:polygon(0_72%,100%_58%,100%_100%,0_100%)] md:[clip-path:polygon(62%_0,100%_0,100%_100%,42%_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[var(--color-primary)]/90 [clip-path:polygon(0_72%,100%_58%,100%_61%,0_75%)] md:[clip-path:polygon(60%_0,62%_0,44%_100%,42%_100%)]"
      />

      <div className="mx-auto grid min-h-[min(820px,calc(100svh-64px))] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.05fr_0.95fr] md:gap-6 md:py-20 lg:px-10">
        <div className="relative z-10">
          {restaurant.city && (
            <p style={delay(150)} className="hero-enter inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)] shadow-sm ring-1 ring-black/5">
              <MapPin className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              {restaurant.city}
            </p>
          )}
          <h1
            style={delay(300)}
            className="hero-enter mt-5 font-[family-name:var(--font-title)] text-5xl font-normal leading-[0.98] tracking-[-0.04em] text-[var(--color-secondary)] sm:text-6xl lg:text-7xl"
          >
            {restaurant.name}
          </h1>
          {restaurant.tagline && (
            <p style={delay(500)} className="hero-enter mt-5 max-w-sm text-base leading-7 text-stone-700 md:max-w-[17rem] lg:max-w-sm sm:text-lg sm:leading-8">
              {L(restaurant.tagline, restaurant.tagline_en)}
            </p>
          )}
          <div style={delay(700)} className="hero-enter mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/reservation" size="lg" className="min-w-48">
              {t("Réserver une table")}
            </ButtonLink>
            <ButtonLink href="/carte" variant="outline" size="lg">
              {t("Voir la carte")}
            </ButtonLink>
          </div>
          {restaurant.google_rating ? (
            <div style={delay(900)} className="hero-enter mt-8 inline-flex rounded-full bg-[var(--color-secondary)] p-0.5">
              <GoogleReviews restaurant={restaurant} />
            </div>
          ) : null}
        </div>

        <div style={delay(400)} className="hero-enter relative mx-auto w-full max-w-[min(88vw,520px)]">
          <div className="relative aspect-square">
            <div aria-hidden="true" className="absolute -inset-3 rounded-full border-2 border-dashed border-white/50 md:border-white/40" />
            <div className="relative h-full w-full overflow-hidden rounded-full border-[10px] border-white shadow-2xl shadow-black/30">
              {restaurant.cover_image_url ? (
                <Image
                  src={restaurant.cover_image_url}
                  alt={restaurant.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 88vw, 520px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[var(--color-primary)]" />
              )}
            </div>
            {restaurant.logo_url && (
              <Image
                src={restaurant.logo_url}
                alt={`Logo ${restaurant.name}`}
                width={88}
                height={88}
                className="hero-bob absolute -bottom-2 left-2 h-20 w-20 rounded-full border-4 border-white bg-white object-cover shadow-xl sm:h-[88px] sm:w-[88px]"
              />
            )}
          </div>
        </div>
      </div>

      <a
        href="#histoire"
        className="hero-enter absolute bottom-5 left-8 hidden items-center lg:left-10 gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 hover:text-[var(--color-secondary)] md:inline-flex"
        style={delay(1200)}
      >
        {t("Découvrir la maison")} <ArrowDown className="hero-bob h-4 w-4" />
      </a>
    </section>
  );
}
