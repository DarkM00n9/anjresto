import Link from "next/link";
import Image from "next/image";
import type { Restaurant } from "@/types/database";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowUpRight } from "lucide-react";
import { getT } from "@/lib/lang";
import { LangSwitch } from "./LangSwitch";

export async function SiteHeader({ restaurant }: { restaurant: Restaurant }) {
  const t = await getT();
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.07] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {restaurant.logo_url && (
            <Image
              src={restaurant.logo_url}
              alt=""
              width={32}
              height={32}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-black/10"
            />
          )}
          <span className="truncate font-[family-name:var(--font-title)] text-base font-medium tracking-tight text-[var(--color-secondary)] sm:text-lg">{restaurant.name}</span>
        </Link>
        <nav aria-label={t("Navigation principale")} className="hidden items-center gap-8 md:flex">
          <Link href="/carte" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600 transition-colors hover:text-[var(--color-primary)]">{t("La carte")}</Link>
          <Link href="/#horaires" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600 transition-colors hover:text-[var(--color-primary)]">{t("Horaires")}</Link>
          <Link href="/#adresse" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600 transition-colors hover:text-[var(--color-primary)]">{t("Nous trouver")}</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <LangSwitch />
          <ButtonLink href="/reservation" size="sm" className="px-4 sm:px-5" icon={<ArrowUpRight className="h-3.5 w-3.5" />}>{t("Réserver")}</ButtonLink>
        </div>
      </div>
    </header>
  );
}
