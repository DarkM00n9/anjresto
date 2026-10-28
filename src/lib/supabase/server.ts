import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Client Supabase pour les Server Components / Route Handlers (lit/écrit les cookies de session). */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component : sans effet, la session est
            // de toute façon rafraîchie par le middleware sur la requête suivante.
          }
        },
      },
    },
  );
}
