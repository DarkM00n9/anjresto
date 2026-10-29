import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, Navigation, Phone } from "lucide-react";
import type { Category, Closure, MenuItem, OpeningHour, Restaurant } from "@/types/database";
import { OpenNowBadge } from "@/components/site/OpenNowBadge";
import { groupHoursByDay } from "@/lib/opening-hours";
import { getActiveClosure } from "@/lib/closures";
import { getLang, getLocalize, getT } from "@/lib/lang";

function galleryImages(restaurant: Restaurant) {
  const key = (url: string) => url.split(/[?#]/, 1)[0];
  const seen = new Set(restaurant.cover_image_url ? [key(restaurant.cover_image_url)] : []);
  return restaurant.gallery_urls.filter((url) => {
    const imageKey = key(url);
    if (seen.has(imageKey)) return false;
    seen.add(imageKey);
    return true;
  });
}

export async function ModernAbout({ restaurant }: { restaurant: Restaurant }) {
  const t = await getT();
  const L = await getLocalize();
  if (!restaurant.description && restaurant.gallery_urls.length === 0) return null;
  const images = galleryImages(restaurant);
  const main = images[0] ?? restaurant.cover_image_url;
  const second = images[1];

  return (
    <section id="histoire" className="maison-home maison-section py-20 sm:py-28 lg:py-32">
      <div className={`maison-shell grid items-center gap-12 lg:gap-24 ${main ? "md:grid-cols-2" : "max-w-3xl"}`}>
        {main && (
          <div className="relative pb-10 pr-10 sm:pb-14 sm:pr-14">
            <figure className="relative m-0 aspect-[4/5] overflow-hidden bg-stone-200">
              <Image src={main} alt={`${restaurant.name} — ${t("La maison en images")}`} fill sizes="(max-width: 768px) 85vw, 42vw" className="object-cover" />
            </figure>
            {second && (
              <div className="absolute bottom-0 right-0 aspect-[4/5] w-[42%] overflow-hidden border-[6px] border-[#f6f3eb] bg-stone-200 sm:border-[10px]">
                <Image src={second} alt={`${restaurant.name} — ${t("Un autre regard")}`} fill sizes="(max-width: 768px) 36vw, 20vw" className="object-cover" />
              </div>
            )}
            <span aria-hidden="true" className="absolute bottom-1 left-0 text-[10px] uppercase tracking-[0.2em] text-stone-500">02 / 03 — {t("La maison")}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="maison-eyebrow"><span className="text-stone-400">01</span>{t("L’esprit de la maison")}</p>
          <h2 className="maison-title mt-6 text-4xl leading-[1.12] sm:text-5xl lg:text-6xl">{t("Une maison.")}<br /><span className="italic text-[var(--color-primary)]">{t("Des moments.")}</span></h2>
          {restaurant.description && <p className="mt-7 whitespace-pre-line text-[15px] leading-8 text-stone-600">{L(restaurant.description, restaurant.description_en)}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-stone-300/70 pt-6 text-[11px] font-medium uppercase tracking-[0.15em]">
            {restaurant.cuisine_type && <span>{restaurant.cuisine_type}</span>}
            {restaurant.city && <span className="text-stone-500">{restaurant.city}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

export async function ModernMenu({ categories, items, restaurant }: { categories: Category[]; items: MenuItem[]; restaurant: Restaurant }) {
  const t = await getT();
  const L = await getLocalize();
  const lang = await getLang();
  if (categories.length === 0 && items.length === 0) return null;
  const names = new Map(categories.map((category) => [category.id, L(category.name, category.name_en)]));
  const picks = [...items].filter((item) => item.is_available).sort((a, b) =>
    Number(b.is_daily_special) - Number(a.is_daily_special) || Number(Boolean(b.photo_url)) - Number(Boolean(a.photo_url)) || a.display_order - b.display_order,
  ).slice(0, 3);
  const scene = galleryImages(restaurant).at(-1);
  const price = new Intl.NumberFormat(lang === "en" ? "en-GB" : "fr-FR", { style: "currency", currency: "EUR" });

  return (
    <section className="maison-menu py-20 sm:py-28">
      <div className="maison-shell">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end md:gap-16">
          <div>
            <p className="maison-eyebrow text-white/65"><span className="text-white/40">02</span>{t("À la carte")}</p>
            <h2 className="maison-title mt-6 text-4xl leading-[1.12] sm:text-5xl lg:text-6xl">{t("L’envie commence")}<br /><span className="italic text-[#e8bba0]">{t("dans l’assiette.")}</span></h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/70">{t("Quelques suggestions pour vous mettre en appétit. Retrouvez tous nos plats et leurs informations sur la carte complète.")}</p>
        </div>

        <div className={`mt-12 grid items-start gap-10 lg:gap-16 ${scene ? "md:grid-cols-[0.85fr_1.15fr]" : ""}`}>
          {scene && (
            <figure className="m-0">
              <div className="relative aspect-[16/10] overflow-hidden bg-white/10 md:aspect-[4/5]">
                <Image src={scene} alt={`${restaurant.name} — ${t("La maison en images")}`} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
              </div>
              <figcaption className="mt-4 flex justify-between gap-4 text-[10px] uppercase tracking-[0.16em] text-white/55"><span>{t("La maison en images")}</span><span aria-hidden="true">03 / 03</span></figcaption>
            </figure>
          )}
          <div>
            {picks.length > 0 ? (
              <div className="border-t border-white/20">
                {picks.map((item, index) => (
                  <article key={item.id} className="border-b border-white/20 py-7 sm:py-8">
                    <div className="flex items-start gap-4">
                      {item.photo_url && <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-white/10"><Image src={item.photo_url} alt={L(item.name, item.name_en) ?? ""} fill sizes="80px" className="object-cover" /></div>}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-[0.17em] text-white/55"><span className="mr-3 text-[#e8bba0]">0{index + 1}</span>{names.get(item.category_id) ?? ""}</p>
                        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
                          <h3 className="maison-title min-w-0 text-2xl leading-tight sm:text-3xl">{L(item.name, item.name_en)}</h3>
                          <span className="shrink-0 text-sm tabular-nums text-[#e8bba0]">{price.format(item.price)}</span>
                        </div>
                        {item.description && <p className="mt-3 text-sm leading-6 text-white/65">{L(item.description, item.description_en)}</p>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-white/20 border-y border-white/20">
                {categories.map((category) => <li key={category.id} className="maison-title py-5 text-2xl">{L(category.name, category.name_en)}</li>)}
              </ul>
            )}
            <Link href="/carte" className="maison-button mt-8">{t("Découvrir toute la carte")}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function ModernVisit({ hours, closures, restaurant }: { hours: OpeningHour[]; closures: Closure[]; restaurant: Restaurant }) {
  const t = await getT();
  const schedule = groupHoursByDay(hours);
  const activeClosure = getActiveClosure(closures);
  const address = [restaurant.address_line, restaurant.postal_code, restaurant.city].filter(Boolean).join(", ");
  const query = encodeURIComponent(address);

  return (
    <section id="horaires" className="maison-home maison-section py-20 sm:py-28">
      <div className="maison-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="maison-eyebrow"><span className="text-stone-400">03</span>{t("Nous rendre visite")}</p><h2 className="maison-title mt-6 text-4xl leading-[1.12] sm:text-5xl lg:text-6xl">{t("On vous garde une place ?")}</h2></div>
          <OpenNowBadge hours={hours} closures={closures} />
        </div>
        <div className={`mt-12 grid gap-12 lg:gap-20 ${address ? "md:grid-cols-2" : "max-w-2xl"}`}>
          <div>
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em]">{t("Horaires")}</h3>
            {activeClosure && <p className="mb-5 border-l-2 border-[var(--color-primary)] bg-white/60 px-4 py-3 text-sm leading-6">{activeClosure.message || t("Fermeture exceptionnelle en cours.")}</p>}
            <ul className="divide-y divide-stone-300/70 border-y border-stone-300/70">
              {schedule.map((day) => (
                <li key={day.day} className={`flex items-start justify-between gap-4 py-4 text-sm ${day.isToday ? "font-semibold text-[var(--color-primary)]" : "text-stone-600"}`}>
                  <span className="flex items-center gap-2">{t(day.label)}{day.isToday && <span className="h-1.5 w-1.5 rounded-full bg-current"><span className="sr-only">{t("Aujourd’hui")}</span></span>}</span>
                  <span className="text-right tabular-nums">{day.isClosed ? t("Fermé") : day.slots.map((slot) => <span key={`${slot.opensAt}-${slot.closesAt}`} className="block">{slot.opensAt} — {slot.closesAt}</span>)}</span>
                </li>
              ))}
            </ul>
            <Link href="/reservation" className="maison-text-link mt-7">{t("Choisir votre moment")}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          {address && (
            <div id="adresse" className="maison-section">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em]">{t("Nous trouver")}</h3>
              <p className="maison-title mt-5 max-w-md text-2xl leading-relaxed">{address}</p>
              <div className="mt-6 overflow-hidden border border-stone-300 bg-stone-200">
                <iframe title={`${t("Nous trouver")} — ${restaurant.name}`} src={`https://www.google.com/maps?q=${query}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[250px] w-full border-0 sm:h-[280px]" />
              </div>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${query}`} target="_blank" rel="noopener noreferrer" className="maison-text-link mt-6"><Navigation className="h-4 w-4" aria-hidden="true" />{t("Préparer mon itinéraire")}</a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export async function ModernContact({ restaurant }: { restaurant: Restaurant }) {
  const t = await getT();
  const image = galleryImages(restaurant)[1] ?? restaurant.cover_image_url;

  return (
    <section id="contact" className="maison-section relative isolate overflow-hidden bg-[var(--color-secondary)] py-20 text-white sm:py-28">
      {image && <Image src={image} alt="" fill sizes="100vw" className="-z-20 object-cover" />}
      <div className="absolute inset-0 -z-10 bg-black/65" />
      <div className="maison-shell grid items-end gap-10 md:grid-cols-[1.3fr_0.7fr]">
        <div><p className="maison-eyebrow text-white/75">{t("À très bientôt")}</p><h2 className="maison-title mt-6 max-w-2xl text-4xl leading-[1.12] sm:text-5xl lg:text-6xl">{t("La prochaine fois,")}<br /><span className="italic">{t("c’est à votre table.")}</span></h2></div>
        <div className="flex flex-col items-start gap-5 md:items-end">
          <Link href="/reservation" className="maison-button">{t("Réserver une table")}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          {restaurant.phone && <a href={`tel:${restaurant.phone.replace(/\s+/g, "")}`} className="inline-flex min-h-11 items-center gap-3 text-sm text-white/85 transition-colors hover:text-white"><Phone className="h-4 w-4" aria-hidden="true" />{restaurant.phone}</a>}
          {restaurant.email && <a href={`mailto:${restaurant.email}`} className="inline-flex min-h-11 max-w-full items-center gap-3 text-sm text-white/85 transition-colors hover:text-white"><Mail className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="break-all">{restaurant.email}</span></a>}
        </div>
      </div>
    </section>
  );
}
