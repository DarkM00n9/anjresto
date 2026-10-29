import "server-only";
import { headers } from "next/headers";

/** Lien public d'un devis, construit depuis le domaine sur lequel le superadmin est ouvert. */
export async function quoteLink(token: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "anjresto.vercel.app";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${proto}://${host}/devis/${token}`;
}
