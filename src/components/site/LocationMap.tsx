import type { Restaurant } from "@/types/database";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import type { LayoutPreset } from "@/lib/layout-presets";

interface LocationMapProps {
  restaurant: Restaurant;
  preset: LayoutPreset;
}

export function LocationMap({ restaurant, preset }: LocationMapProps) {
  const fullAddress = [restaurant.address_line, restaurant.postal_code, restaurant.city]
    .filter(Boolean)
    .join(", ");

  if (!fullAddress) return null;

  const query = encodeURIComponent(fullAddress);

  return (
    <Section id="adresse" spacing={preset.sectionSpacing} className="bg-black/[0.02]">
      <h2 className="font-[family-name:var(--font-title)] text-3xl font-bold text-[var(--color-secondary)]">
        Nous trouver
      </h2>
      <p className="mt-2 text-black/70">{fullAddress}</p>
      <div className={`mt-6 overflow-hidden ${preset.radius} ${preset.shadow}`}>
        <iframe
          title={`Carte - ${restaurant.name}`}
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          width="100%"
          height="360"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="border-0"
        />
      </div>
      <div className="mt-4">
        <ButtonLink
          href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
        >
          Itinéraire
        </ButtonLink>
      </div>
    </Section>
  );
}
