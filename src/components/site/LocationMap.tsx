import type { Restaurant } from "@/types/database";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import type { LayoutPreset } from "@/lib/layout-presets";
import { Navigation } from "lucide-react";
import { getT } from "@/lib/lang";


interface LocationMapProps {
  restaurant: Restaurant;
  preset: LayoutPreset;
}

export async function LocationMap({ restaurant, preset }: LocationMapProps) {
  const t = await getT();
  const fullAddress = [restaurant.address_line, restaurant.postal_code, restaurant.city]
    .filter(Boolean)
    .join(", ");

  if (!fullAddress) return null;

  const query = encodeURIComponent(fullAddress);

  return (
    <Section id="adresse" spacing="py-20 md:py-32" className="bg-stone-200">
      <div className="grid items-center gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div>
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            <span className="h-px w-8 bg-[var(--color-primary)]" />{t("Nous rendre visite")}
          </p>
          <h2 className="mt-6 font-[family-name:var(--font-title)] text-4xl font-normal leading-[1.05] tracking-[-0.035em] text-[var(--color-secondary)] sm:text-5xl">
            {t("Nous trouver")}
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-stone-700">{fullAddress}</p>
          <div className="mt-7">
            <ButtonLink
              href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              icon={<Navigation className="h-4 w-4" />}
            >
              {t("Préparer mon itinéraire")}
            </ButtonLink>
          </div>
        </div>
        <div className={`overflow-hidden border border-black/10 bg-white ${preset.radius} ${preset.shadow}`}>
          <iframe
            title={`Carte - ${restaurant.name}`}
            src={`https://www.google.com/maps?q=${query}&output=embed`}
            width="100%"
            height="420"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[300px] w-full border-0 grayscale sm:h-[380px] lg:h-[420px]"
          />
        </div>
      </div>
    </Section>
  );
}
