"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { translateToEnglish } from "@/lib/translate";
import { OWNER_ONLY } from "@/lib/permissions";
import { requireAdminContext } from "./guard";

/** Traduit en anglais tout le contenu du restaurant (site, carte, menu du jour) en une fois. */
export async function translateAllContent(): Promise<{ success: boolean; count: number; error?: string }> {
  const { restaurant } = await requireAdminContext(OWNER_ONLY);
  if (!process.env.DEEPL_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return { success: false, count: 0, error: "La traduction automatique n'est pas activée (clé DEEPL_API_KEY ou ANTHROPIC_API_KEY manquante)." };
  }
  const supabase = await createClient();

  const [{ data: categories }, { data: items }, { data: menus }] = await Promise.all([
    supabase.from("categories").select("id, name, description").eq("restaurant_id", restaurant.id),
    supabase.from("menu_items").select("id, name, description").eq("restaurant_id", restaurant.id),
    supabase.from("daily_menus").select("id, title, starter, main, dessert").eq("restaurant_id", restaurant.id),
  ]);

  const texts: Record<string, string> = {};
  const put = (key: string, value: string | null | undefined) => {
    if (value && value.trim()) texts[key] = value;
  };
  put("r:tagline", restaurant.tagline);
  put("r:description", restaurant.description);
  for (const c of categories ?? []) { put(`c:${c.id}:name`, c.name); put(`c:${c.id}:description`, c.description); }
  for (const i of items ?? []) { put(`i:${i.id}:name`, i.name); put(`i:${i.id}:description`, i.description); }
  for (const m of menus ?? []) {
    put(`m:${m.id}:title`, m.title); put(`m:${m.id}:starter`, m.starter);
    put(`m:${m.id}:main`, m.main); put(`m:${m.id}:dessert`, m.dessert);
  }

  // Traduction par lots pour rester sous les limites de l'API.
  const keys = Object.keys(texts);
  const result: Record<string, string> = {};
  for (let i = 0; i < keys.length; i += 40) {
    const chunk = Object.fromEntries(keys.slice(i, i + 40).map((k) => [k, texts[k]]));
    Object.assign(result, await translateToEnglish(chunk));
  }
  if (Object.keys(result).length === 0) return { success: false, count: 0, error: "La traduction a échoué. Réessaie dans un instant." };

  const group = new Map<string, Record<string, string>>();
  for (const [key, value] of Object.entries(result)) {
    const [kind, id, field] = key.split(":");
    const gk = field ? `${kind}:${id}` : kind;
    group.set(gk, { ...(group.get(gk) ?? {}), [field ?? id]: value });
  }

  const jobs: PromiseLike<unknown>[] = [];
  for (const [gk, fields] of group) {
    const [kind, id] = gk.split(":");
    if (kind === "r") {
      jobs.push(supabase.from("restaurants").update({ tagline_en: fields.tagline ?? null, description_en: fields.description ?? null }).eq("id", restaurant.id));
    } else if (kind === "c") {
      jobs.push(supabase.from("categories").update({ name_en: fields.name ?? null, description_en: fields.description ?? null }).eq("id", id));
    } else if (kind === "i") {
      jobs.push(supabase.from("menu_items").update({ name_en: fields.name ?? null, description_en: fields.description ?? null }).eq("id", id));
    } else if (kind === "m") {
      jobs.push(
        supabase.from("daily_menus").update({ title_en: fields.title ?? null, starter_en: fields.starter ?? null, main_en: fields.main ?? null, dessert_en: fields.dessert ?? null }).eq("id", id),
      );
    }
  }
  await Promise.all(jobs);

  revalidatePath("/", "layout");
  return { success: true, count: Object.keys(result).length };
}
