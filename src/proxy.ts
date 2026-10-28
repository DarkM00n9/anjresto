import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const LOCAL_HOSTS = new Set(["localhost:3000", "127.0.0.1:3000"]);

async function isPublishedSlug(slug: string): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return data !== null;
}

/**
 * Résolution multi-tenant :
 * - En local : /r/{slug}/... est réécrit vers /... avec le slug transmis en header,
 *   et mémorisé dans un cookie (si le slug est valide) pour que les liens internes
 *   (sans préfixe /r/{slug}) continuent de résoudre le bon restaurant.
 * - En prod (sous-domaine {slug}.MON-DOMAINE ou domaine personnalisé) : aucune
 *   réécriture n'est nécessaire, le host est simplement transmis tel quel ;
 *   c'est `getCurrentRestaurant` (lib/get-current-restaurant.ts) qui résout en BDD.
 */
export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;
  const isLocal = LOCAL_HOSTS.has(host);

  if (isLocal && pathname.startsWith("/r/")) {
    const segments = pathname.split("/").filter(Boolean); // ["r", slug, ...rest]
    const slug = segments[1];
    const rest = "/" + segments.slice(2).join("/");

    const url = request.nextUrl.clone();
    url.pathname = rest;

    const requestHeaders = new Headers(request.headers);
    if (slug) requestHeaders.set("x-restaurant-slug", slug);

    const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });

    // On ne mémorise le slug en cookie que s'il correspond à un restaurant publié,
    // pour ne pas "polluer" la navigation locale avec un slug invalide.
    if (slug && (await isPublishedSlug(slug))) {
      response.cookies.set("restaurant_slug", slug, { path: "/", sameSite: "lax" });
    }
    return response;
  }

  const requestHeaders = new Headers(request.headers);

  if (isLocal) {
    const cookieSlug = request.cookies.get("restaurant_slug")?.value;
    if (cookieSlug) requestHeaders.set("x-restaurant-slug", cookieSlug);
  }

  requestHeaders.set("x-restaurant-host", host);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // sitemap.xml et robots.txt doivent passer par le proxy (résolution du tenant via cookie en local).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)"],
};
