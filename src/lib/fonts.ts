import {
  Playfair_Display,
  Poppins,
  Lora,
  Montserrat,
  Cormorant_Garamond,
  Raleway,
} from "next/font/google";

// `next/font/google` exige des appels statiques : on charge les 6 polices
// autorisées une fois ici, puis on sélectionne la bonne par nom (lib/theme.ts).

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-title",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-title",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});

export const TITLE_FONTS = {
  "Playfair Display": playfairDisplay,
  Poppins: poppins,
  Lora: lora,
  Montserrat: montserrat,
  "Cormorant Garamond": cormorantGaramond,
  Raleway: raleway,
} as const;

export type TitleFontName = keyof typeof TITLE_FONTS;

export const TITLE_FONT_NAMES = Object.keys(TITLE_FONTS) as TitleFontName[];
