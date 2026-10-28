import type { Restaurant } from "@/types/database";
import { Section } from "@/components/ui/Section";
import type { LayoutPreset } from "@/lib/layout-presets";

interface ContactSectionProps {
  restaurant: Restaurant;
  preset: LayoutPreset;
}

export function ContactSection({ restaurant, preset }: ContactSectionProps) {
  return (
    <Section id="contact" spacing={preset.sectionSpacing}>
      <h2 className="font-[family-name:var(--font-title)] text-3xl font-bold text-[var(--color-secondary)]">
        Contact & réservation
      </h2>
      <div className="mt-6 flex flex-col gap-3 text-black/70">
        {restaurant.phone && (
          <a
            href={`tel:${restaurant.phone.replace(/\s+/g, "")}`}
            className="text-lg font-semibold text-[var(--color-primary)]"
          >
            {restaurant.phone}
          </a>
        )}
        {restaurant.email && (
          <a href={`mailto:${restaurant.email}`} className="underline">
            {restaurant.email}
          </a>
        )}
        <div className="flex gap-4 pt-2">
          {restaurant.instagram_url && (
            <a href={restaurant.instagram_url} target="_blank" rel="noopener noreferrer" className="underline">
              Instagram
            </a>
          )}
          {restaurant.facebook_url && (
            <a href={restaurant.facebook_url} target="_blank" rel="noopener noreferrer" className="underline">
              Facebook
            </a>
          )}
        </div>
      </div>
    </Section>
  );
}
