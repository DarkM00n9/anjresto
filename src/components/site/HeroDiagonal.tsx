import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Restaurant } from "@/types/database";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { GoogleReviews } from "./GoogleReviews";
import { getT, getLocalize } from "@/lib/lang";

/** Composition éditoriale du thème moderne, avec une découpe diagonale discrète. */
export async function HeroDiagonal({ restaurant }: { restaurant: Restaurant }) {
  const t = await getT();
  const L = await getLocalize();
  const introduction = L(restaurant.description, restaurant.description_en)?.split(/\n\s*\n/)[0];
  const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties;

  return (
    <section className="maison-home maison-hero">
      <div className="maison-shell grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:py-16">
        <div className="min-w-0 lg:py-6">
          <p className="maison-eyebrow hero-enter" style={delay(80)}>
            <span className="h-px w-7 bg-current" aria-hidden="true" />
            {[restaurant.city, restaurant.cuisine_type].filter(Boolean).join(" · ") || t("La maison")}
          </p>
          <h1 className="maison-title hero-enter mt-7 text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.98]" style={delay(160)}>
            {restaurant.name}
          </h1>
          <p className="maison-title hero-enter mt-5 max-w-lg text-3xl italic leading-[1.2] text-[var(--color-primary)] sm:text-4xl" style={delay(240)}>
            {t("Les bons moments se partagent.")}
          </p>
          <p className="hero-enter mt-7 max-w-md text-[15px] leading-7 text-stone-600" style={delay(320)}>
            {introduction || L(restaurant.tagline, restaurant.tagline_en) || t("Une table, une cuisine, un moment à partager.")}
          </p>
          <div className="hero-enter mt-8 flex flex-wrap items-center gap-x-7 gap-y-5" style={delay(400)}>
            <Link href="/reservation" className="maison-button">
              {t("Réserver une table")} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/carte" className="maison-text-link">
              {t("Voir la carte")} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {restaurant.google_rating ? (
            <div className="mt-7 inline-flex rounded-full bg-[var(--color-secondary)] p-0.5">
              <GoogleReviews restaurant={restaurant} />
            </div>
          ) : null}
          <a href="#histoire" className="mt-12 inline-flex min-h-11 items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 transition-colors hover:text-[var(--color-primary)]">
            <ArrowDown className="h-4 w-4" aria-hidden="true" /> {t("Découvrir la maison")}
          </a>
        </div>

        <figure className="hero-enter relative m-0" style={delay(220)}>
          <div className="maison-hero-photo relative aspect-[4/5] overflow-hidden bg-[var(--color-secondary)] sm:aspect-[5/4] lg:aspect-[4/5]">
            {restaurant.cover_image_url && (
              <Image src={restaurant.cover_image_url} alt={`${restaurant.name} — ${t("La maison")}`} fill preload sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-x-6 bottom-7 flex items-end justify-between gap-5 text-white sm:inset-x-8">
              <span className="font-[family-name:var(--font-title)] text-3xl italic sm:text-4xl">{t("À table.")}</span>
              {restaurant.city && <span className="pb-1 text-[10px] font-medium uppercase tracking-[0.2em]">{restaurant.city}</span>}
            </div>
          </div>
          <figcaption className="mt-4 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em] text-stone-500">
            <span>{t("Le plaisir d’être ensemble")}</span>
            <span aria-hidden="true">01 / 03</span>
          </figcaption>
        </figure>
      </div>
      <nav aria-label={t("Explorer le restaurant")} className="border-y border-stone-300/70">
        <div className="maison-shell grid grid-cols-3 divide-x divide-stone-300/70">
          {[
            { href: "/carte", label: t("La carte") },
            { href: "#horaires", label: t("Horaires") },
            { href: "#adresse", label: t("Nous trouver") },
          ].map((item, index) => (
            <Link key={item.href} href={item.href} className="group flex min-h-16 items-center justify-between gap-2 px-2 py-4 text-xs font-medium transition-colors hover:text-[var(--color-primary)] sm:px-6 sm:py-5 sm:text-sm">
              <span><span className="mr-3 hidden text-[10px] text-stone-400 sm:inline">0{index + 1}</span>{item.label}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </nav>
    </section>
  );
}
