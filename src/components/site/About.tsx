import Image from "next/image";
import type { Restaurant } from "@/types/database";
import { Section } from "@/components/ui/Section";
import type { LayoutPreset } from "@/lib/layout-presets";

interface AboutProps {
  restaurant: Restaurant;
  preset: LayoutPreset;
}

export function About({ restaurant, preset }: AboutProps) {
  if (!restaurant.description && restaurant.gallery_urls.length === 0) return null;

  return (
    <Section spacing={preset.sectionSpacing}>
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-[family-name:var(--font-title)] text-3xl font-bold text-[var(--color-secondary)]">
            À propos
          </h2>
          {restaurant.description && (
            <p className="mt-4 whitespace-pre-line text-black/70">{restaurant.description}</p>
          )}
        </div>
        {restaurant.gallery_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {restaurant.gallery_urls.slice(0, 4).map((url) => (
              <div key={url} className={`relative aspect-square overflow-hidden ${preset.radius}`}>
                <Image src={url} alt={restaurant.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
