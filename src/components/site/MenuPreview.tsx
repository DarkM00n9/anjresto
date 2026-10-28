import type { Category } from "@/types/database";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import type { LayoutPreset } from "@/lib/layout-presets";

interface MenuPreviewProps {
  categories: Category[];
  preset: LayoutPreset;
}

export function MenuPreview({ categories, preset }: MenuPreviewProps) {
  if (categories.length === 0) return null;

  return (
    <Section spacing={preset.sectionSpacing} className="bg-black/[0.02]">
      <div className="text-center">
        <h2 className="font-[family-name:var(--font-title)] text-3xl font-bold text-[var(--color-secondary)]">
          La carte
        </h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {categories.map((category) => (
            <span
              key={category.id}
              className={`px-4 py-2 text-sm font-medium ${preset.cardStyle} ${preset.radius}`}
            >
              {category.name}
            </span>
          ))}
        </div>
        <div className="mt-8">
          <ButtonLink href="/carte">Voir la carte complète</ButtonLink>
        </div>
      </div>
    </Section>
  );
}
