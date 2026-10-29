"use client";

import { createContext, useContext, type ReactNode } from "react";
import { translate, type Lang } from "@/lib/i18n";

const LangContext = createContext<Lang>("fr");

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Traducteur pour les composants client : `const t = useT(); t("Horaires")`. */
export function useT() {
  const lang = useContext(LangContext);
  return (text: string) => translate(lang, text);
}

export function useLang() {
  return useContext(LangContext);
}
