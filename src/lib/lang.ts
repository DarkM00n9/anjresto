import { cookies } from "next/headers";
import { localized, translate, type Lang } from "@/lib/i18n";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get("lang")?.value === "en" ? "en" : "fr";
}

/** Traducteur pour les composants serveur : `const t = await getT(); t("Horaires")`. */
/** Version localisée d'un texte saisi par le restaurant (composants serveur). */
export async function getLocalize() {
  const lang = await getLang();
  return (fr: string | null | undefined, en?: string | null) => localized(lang, fr, en);
}

export async function getT() {
  const lang = await getLang();
  return (text: string) => translate(lang, text);
}
