import type { CSSProperties } from "react";
import { TITLE_FONTS, type TitleFontName } from "@/lib/fonts";
import type { Restaurant } from "@/types/database";

export function resolveTitleFont(fontName: string) {
  return TITLE_FONTS[fontName as TitleFontName] ?? TITLE_FONTS["Playfair Display"];
}

/** Variables CSS injectées sur le document pour le thème du restaurant courant. */
export function themeCssVars(restaurant: Restaurant): CSSProperties {
  return {
    "--color-primary": restaurant.theme.primary_color,
    "--color-secondary": restaurant.theme.secondary_color,
  } as CSSProperties;
}
