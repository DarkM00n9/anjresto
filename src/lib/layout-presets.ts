import type { LayoutStyle } from "@/types/database";

export interface LayoutPreset {
  label: string;
  heroVariant: "overlay" | "diagonal";
  heroOverlay: string;
  sectionSpacing: string;
  radius: string;
  shadow: string;
  cardStyle: string;
}

export const LAYOUT_PRESETS: Record<LayoutStyle, LayoutPreset> = {
  bistrot_chaleureux: {
    label: "Bistrot chaleureux",
    heroVariant: "overlay",
    heroOverlay: "bg-black/55",
    sectionSpacing: "py-16 md:py-24",
    radius: "rounded-2xl",
    shadow: "shadow-lg",
    cardStyle: "border border-black/5 bg-white",
  },
  moderne_epure: {
    label: "Moderne épuré",
    heroVariant: "overlay",
    heroOverlay: "bg-black/35",
    sectionSpacing: "py-20 md:py-28",
    radius: "rounded-none",
    shadow: "shadow-none",
    cardStyle: "border-b border-black/10 bg-transparent",
  },
  mediterraneen: {
    label: "Méditerranéen",
    heroVariant: "overlay",
    heroOverlay: "bg-black/40",
    sectionSpacing: "py-16 md:py-24",
    radius: "rounded-3xl",
    shadow: "shadow-md",
    cardStyle: "border border-black/5 bg-white/90",
  },
  diagonale: {
    label: "Moderne diagonale",
    heroVariant: "diagonal",
    heroOverlay: "bg-black/35",
    sectionSpacing: "py-16 md:py-24",
    radius: "rounded-3xl",
    shadow: "shadow-md",
    cardStyle: "border border-black/5 bg-white",
  },
};

export function getLayoutPreset(style: LayoutStyle): LayoutPreset {
  return LAYOUT_PRESETS[style] ?? LAYOUT_PRESETS.bistrot_chaleureux;
}
