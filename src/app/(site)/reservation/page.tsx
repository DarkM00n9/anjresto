import type { Metadata } from "next";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getReservationSettings } from "@/lib/get-reservations";
import { Section } from "@/components/ui/Section";
import { ReservationForm } from "@/components/reservation/ReservationForm";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import { getT } from "@/lib/lang";
import { getLayoutPreset } from "@/lib/layout-presets";


export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await requireCurrentRestaurant();
  return {
    title: `Réserver une table — ${restaurant.name}`,
    description: `Réservez en ligne votre table chez ${restaurant.name}${restaurant.city ? ` à ${restaurant.city}` : ""}, sans frais.`,
    alternates: { canonical: "/reservation" },
  };
}

export default async function ReservationPage() {
  const restaurant = await requireCurrentRestaurant();
  const settings = await getReservationSettings(restaurant.id);
  const t = await getT();
  const modern = getLayoutPreset(restaurant.theme.layout_style).heroVariant === "diagonal";


  return (
    <Section spacing="py-10 md:py-16" className={modern ? "relative isolate overflow-hidden bg-stone-50" : "bg-stone-200"}>
      {modern && <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[var(--color-secondary)] [clip-path:polygon(0_82%,100%_70%,100%_100%,0_100%)] lg:[clip-path:polygon(58%_0,100%_0,100%_100%,42%_100%)]" />}
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12">
        <div className="lg:pt-3">
          <p className={modern ? "inline-flex rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]" : "flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]"}>
            {!modern && <span className="h-px w-8 bg-[var(--color-primary)]" />}{t("Au plaisir de vous accueillir")}
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-title)] text-4xl font-normal leading-[1.05] tracking-[-0.035em] text-[var(--color-secondary)] sm:text-5xl lg:text-6xl">
            {t("Réserver une table")}
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-stone-700">{t("Choisissez votre date et votre heure. Nous vous confirmerons votre réservation par e-mail.")}</p>
          {restaurant.cover_image_url && (
            <div className={`relative mt-8 aspect-[16/9] overflow-hidden bg-stone-200 sm:aspect-[4/3] ${modern ? "rounded-[2.5rem] shadow-2xl shadow-black/15" : "rounded-2xl"}`}>
              <Image src={restaurant.cover_image_url} alt={`La maison ${restaurant.name}`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 font-[family-name:var(--font-title)] text-2xl font-medium text-white sm:text-3xl">{restaurant.name}</p>
            </div>
          )}
          <div className="mt-6 space-y-3 text-sm text-stone-700">
            <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[var(--color-primary)]" /> {t("Choisissez parmi les créneaux disponibles")}</p>
            {restaurant.phone && <a href={`tel:${restaurant.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 transition-colors hover:text-[var(--color-primary)]"><Clock3 className="h-4 w-4 text-[var(--color-primary)]" /> {t("Une question ?")} {restaurant.phone}</a>}
            {restaurant.city && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--color-primary)]" />{restaurant.city}</p>}
          </div>
        </div>
        <Card className={`p-5 sm:p-8 ${modern ? "rounded-[2rem] border-0 shadow-2xl shadow-black/20" : "rounded-3xl border-stone-200/80 shadow-xl shadow-stone-900/[0.035]"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">{t("Votre visite")}</p>
          <h2 className="mt-2 font-[family-name:var(--font-title)] text-2xl font-medium text-[var(--color-secondary)] sm:text-3xl">{t("Choisir votre moment")}</h2>
          <p className="mt-2 mb-7 text-sm text-stone-600">{restaurant.name}</p>
          <ReservationForm restaurantId={restaurant.id} settings={settings} restaurantPhone={restaurant.phone} restaurantName={restaurant.name} restaurantAddress={[restaurant.address_line, restaurant.postal_code, restaurant.city].filter(Boolean).join(", ")} />
        </Card>
      </div>
    </Section>
  );
}
