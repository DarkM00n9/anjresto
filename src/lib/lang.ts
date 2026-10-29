import { cookies } from "next/headers";
import { translate, type Lang } from "@/lib/i18n";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get("lang")?.value === "en" ? "en" : "fr";
}

/** Traducteur pour les composants serveur : `const t = await getT(); t("Horaires")`. */
export async function getT() {
  const lang = await getLang();
  return (text: string) => translate(lang, text);
}
