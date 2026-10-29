import Link from "next/link";
import type { Restaurant } from "@/types/database";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { getT, getLocalize } from "@/lib/lang";


export async function SiteFooter({ restaurant, modern = false }: { restaurant: Restaurant; modern?: boolean }) {
  const t = await getT();
  const L = await getLocalize();
  const address = [restaurant.address_line, restaurant.postal_code, restaurant.city]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className={modern ? "border-t border-white/15 bg-[var(--color-secondary)] text-stone-100" : "bg-[#1d1c19] text-stone-100"}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.7fr] md:gap-12 md:py-20 lg:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">{t("La maison")}</p>
          <Link href="/" className="mt-3 inline-block font-[family-name:var(--font-title)] text-3xl font-normal tracking-tight sm:text-4xl">{restaurant.name}</Link>
          {modern ? (
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">{t("Une table, une cuisine, un moment à partager.")}</p>
          ) : restaurant.tagline && <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">{L(restaurant.tagline, restaurant.tagline_en)}</p>}
        </div>

        <div className="space-y-4 text-sm text-white/80">
          {address && <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />{address}</p>}
          {restaurant.phone && <a href={`tel:${restaurant.phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 transition-colors hover:text-white"><Phone className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />{restaurant.phone}</a>}
          <ButtonLink href="/reservation" variant="outline-white" size="sm" className="mt-2" icon={<ArrowUpRight className="h-3.5 w-3.5" />}>{t("Réserver une table")}</ButtonLink>
        </div>

        <nav aria-label="Liens de pied de page" className="flex flex-col items-start gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
          <Link href="/" className="transition-colors hover:text-white">{t("Accueil")}</Link>
          <Link href="/carte" className="transition-colors hover:text-white">{t("La carte")}</Link>
          <Link href="/#horaires" className="transition-colors hover:text-white">{t("Horaires")}</Link>
          <Link href="/mentions-legales" className="transition-colors hover:text-white">{t("Mentions légales")}</Link>
          <Link href="/confidentialite" className="transition-colors hover:text-white">{t("Confidentialité")}</Link>
        </nav>
      </div>

      <div className="border-t border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-[11px] text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {restaurant.name}. {t("Tous droits réservés.")}</span>
          <span>{t("Site conçu par ANJ Agency")}</span>
        </div>
      </div>
    </footer>
  );
}
