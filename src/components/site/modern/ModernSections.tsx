import Image from "next/image";
import { ArrowUpRight, Clock, Mail, MapPin, Navigation, Phone, Star, UtensilsCrossed } from "lucide-react";
import type { Category, Closure, MenuItem, OpeningHour, Restaurant } from "@/types/database";
import { ButtonLink } from "@/components/ui/Button";
import { OpenNowBadge } from "@/components/site/OpenNowBadge";
import { groupHoursByDay } from "@/lib/opening-hours";
import { getActiveClosure } from "@/lib/closures";
import { getLocalize, getT } from "@/lib/lang";

/** Petite étiquette arrondie au-dessus des titres. */
function Pill({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${
        dark ? "bg-white/10 text-white ring-1 ring-white/20" : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
      }`}
    >
      {children}
    </span>
  );
}

const TITLE = "font-[family-name:var(--font-title)] font-normal leading-[1.02] tracking-[-0.035em]";

/* ------------------------------------------------------------------ Histoire */
export async function ModernAbout({ restaurant }: { restaurant: Restaurant }) {
  const t = await getT();
  const L = await getLocalize();
  if (!restaurant.description && restaurant.gallery_urls.length === 0) return null;
  const images = restaurant.gallery_urls.slice(0, 2);
  const main = images[0] ?? restaurant.cover_image_url;
  const second = images[1] ?? null;

  return (
    <section id="histoire" className="bg-stone-50 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 md:grid-cols-2 lg:px-10">
        {main && (
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-black/15">
              <Image src={main} alt={restaurant.name} fill sizes="(max-width: 768px) 90vw, 520px" className="object-cover" />
            </div>
            {second && (
              <div className="absolute -bottom-8 -right-4 h-40 w-40 overflow-hidden rounded-full border-[8px] border-stone-50 shadow-xl sm:-right-8 sm:h-52 sm:w-52">
                <Image src={second} alt="" fill sizes="208px" className="object-cover" />
              </div>
            )}
            <div aria-hidden="true" className="absolute -left-6 -top-6 -z-10 h-32 w-32 rounded-full bg-[var(--color-primary)]/20" />
          </div>
        )}
        <div>
          <Pill>{t("Notre histoire")}</Pill>
          <h2 className={`${TITLE} mt-5 text-4xl text-[var(--color-secondary)] sm:text-5xl lg:text-6xl`}>{t("L’esprit de la maison")}</h2>
          {restaurant.description && (
            <p className="mt-6 max-w-xl whitespace-pre-line text-base leading-8 text-stone-700 sm:text-lg">{L(restaurant.description, restaurant.description_en)}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {restaurant.cuisine_type && (
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--color-secondary)] shadow-sm ring-1 ring-black/5">{restaurant.cuisine_type}</span>
            )}
            {restaurant.city && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--color-secondary)] shadow-sm ring-1 ring-black/5">
                <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                {restaurant.city}
              </span>
            )}
            {restaurant.google_rating ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--color-secondary)] shadow-sm ring-1 ring-black/5">
                <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                {Number(restaurant.google_rating).toFixed(1)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- Carte */
export async function ModernMenu({ categories, items }: { categories: Category[]; items: MenuItem[] }) {
  const t = await getT();
  const L = await getLocalize();
  if (categories.length === 0 && items.length === 0) return null;
  const names = new Map(categories.map((c) => [c.id, L(c.name, c.name_en)]));
  const picks = [...items]
    .filter((i) => i.is_available)
    .sort(
      (a, b) =>
        Number(b.is_daily_special) - Number(a.is_daily_special) ||
        Number(Boolean(b.photo_url)) - Number(Boolean(a.photo_url)) ||
        a.display_order - b.display_order,
    )
    .slice(0, 4);

  return (
    <section className="relative bg-[var(--color-secondary)] py-24 text-white [clip-path:polygon(0_6%,100%_0,100%_94%,0_100%)] md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Pill dark>{t("La carte")}</Pill>
            <h2 className={`${TITLE} mt-5 max-w-xl text-4xl sm:text-5xl lg:text-6xl`}>{t("Un avant-goût de la maison")}</h2>
          </div>
          <ButtonLink href="/carte" size="lg" icon={<ArrowUpRight className="h-4 w-4" />}>
            {t("Découvrir toute la carte")}
          </ButtonLink>
        </div>

        {picks.length > 0 ? (
          <div className="mt-20 grid gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-4">
            {picks.map((item) => (
              <article key={item.id} className="relative rounded-[2rem] bg-white px-5 pb-6 pt-20 text-center text-stone-900 shadow-xl shadow-black/20">
                <div className="absolute -top-14 left-1/2 h-32 w-32 -translate-x-1/2 overflow-hidden rounded-full border-[6px] border-[var(--color-secondary)] bg-stone-200 shadow-lg">
                  {item.photo_url ? (
                    <Image src={item.photo_url} alt={L(item.name, item.name_en) ?? ""} fill sizes="128px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/25 to-[var(--color-primary)]/10 text-[var(--color-primary)]"><UtensilsCrossed className="h-10 w-10" /></div>
                  )}
                </div>
                {names.get(item.category_id) && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{names.get(item.category_id)}</p>
                )}
                <h3 className={`${TITLE} mt-1 text-xl text-[var(--color-secondary)]`}>{L(item.name, item.name_en)}</h3>
                {item.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{L(item.description, item.description_en)}</p>}
                <span className="mt-4 inline-block rounded-full bg-[var(--color-primary)] px-4 py-1.5 text-sm font-bold tabular-nums text-white">
                  {item.price.toFixed(2)} €
                </span>
              </article>
            ))}
          </div>
        ) : (
          <ul className="mt-12 flex flex-wrap gap-3">
            {categories.map((c) => (
              <li key={c.id} className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold ring-1 ring-white/20">{L(c.name, c.name_en)}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- Horaires */
export async function ModernHours({ hours, closures, restaurant }: { hours: OpeningHour[]; closures: Closure[]; restaurant: Restaurant }) {
  const t = await getT();
  const schedule = groupHoursByDay(hours);
  const activeClosure = getActiveClosure(closures);

  return (
    <section id="horaires" className="bg-stone-50 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-stretch gap-8 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-black/5 ring-1 ring-black/5 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Pill>{t("À votre rythme")}</Pill>
              <h2 className={`${TITLE} mt-4 text-4xl text-[var(--color-secondary)] sm:text-5xl`}>{t("Horaires")}</h2>
            </div>
            <OpenNowBadge hours={hours} closures={closures} />
          </div>
          {activeClosure && (
            <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{activeClosure.message || t("Fermeture exceptionnelle en cours.")}</p>
          )}
          <ul className="mt-6 space-y-1.5">
            {schedule.map((day) => (
              <li
                key={day.day}
                className={`flex items-center justify-between gap-4 rounded-full px-5 py-3 text-sm ${
                  day.isToday ? "bg-[var(--color-primary)] font-semibold text-white" : "text-stone-700 odd:bg-stone-50"
                }`}
              >
                <span>{t(day.label)}</span>
                <span className="text-right">
                  {day.isClosed ? t("Fermé") : day.slots.map((s) => `${s.opensAt} – ${s.closesAt}`).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[var(--color-primary)] p-8 text-white shadow-xl shadow-black/10 sm:p-10">
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-black/10" />
          <div className="relative">
            <Clock className="h-9 w-9" />
            <h3 className={`${TITLE} mt-5 text-3xl sm:text-4xl`}>{t("Réserver une table")}</h3>
            <p className="mt-3 max-w-sm text-white/90">
              {t("Nous serons ravis de vous accueillir. Pensez à réserver votre table pour le créneau qui vous convient.")}
            </p>
          </div>
          <div className="relative mt-8">
            <ButtonLink href="/reservation" variant="outline-white" size="lg" icon={<ArrowUpRight className="h-4 w-4" />}>
              {t("Réserver une table")}
            </ButtonLink>
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone.replace(/\s+/g, "")}`} className="mt-5 flex items-center gap-2 text-sm font-semibold text-white/95">
                <Phone className="h-4 w-4" /> {restaurant.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- Adresse */
export async function ModernLocation({ restaurant }: { restaurant: Restaurant }) {
  const t = await getT();
  const address = [restaurant.address_line, restaurant.postal_code, restaurant.city].filter(Boolean).join(", ");
  if (!address) return null;
  const query = encodeURIComponent(address);

  return (
    <section id="adresse" className="bg-stone-50 pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-black/10 ring-1 ring-black/5">
          <iframe
            title={`Carte - ${restaurant.name}`}
            src={`https://www.google.com/maps?q=${query}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[420px] w-full border-0 sm:h-[480px]"
          />
          <div className="absolute inset-x-4 bottom-4 rounded-3xl bg-white p-5 shadow-xl sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm sm:p-6">
            <Pill>{t("Nous rendre visite")}</Pill>
            <h2 className={`${TITLE} mt-3 text-3xl text-[var(--color-secondary)]`}>{t("Nous trouver")}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">{address}</p>
            <div className="mt-4">
              <ButtonLink
                href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                icon={<Navigation className="h-4 w-4" />}
              >
                {t("Préparer mon itinéraire")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- Contact */
export async function ModernContact({ restaurant }: { restaurant: Restaurant }) {
  const t = await getT();
  return (
    <section id="contact" className="bg-stone-50 pb-24 md:pb-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--color-secondary)] px-6 py-14 text-center text-white sm:px-12 md:py-20">
          <div aria-hidden="true" className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[var(--color-primary)]/30" />
          <div aria-hidden="true" className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/5" />
          <div className="relative mx-auto max-w-2xl">
            <Pill dark>{t("À très bientôt")}</Pill>
            <h2 className={`${TITLE} mt-5 text-4xl sm:text-5xl lg:text-6xl`}>{t("Le plaisir de vous recevoir")}</h2>
            <p className="mx-auto mt-5 max-w-lg text-white/85">
              {t("Pour une demande particulière ou pour choisir votre prochain moment à table, notre équipe est à votre écoute.")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/reservation" size="lg" icon={<ArrowUpRight className="h-4 w-4" />}>
                {t("Réserver une table")}
              </ButtonLink>
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/10">
                  <Phone className="h-4 w-4" /> {restaurant.phone}
                </a>
              )}
              {restaurant.email && (
                <a href={`mailto:${restaurant.email}`} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/10">
                  <Mail className="h-4 w-4" /> E-mail
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
