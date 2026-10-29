"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLang(lang: "fr" | "en") {
  const store = await cookies();
  store.set("lang", lang === "en" ? "en" : "fr", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}
