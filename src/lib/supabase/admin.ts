import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service_role (contourne la RLS).
 * Réservé au code serveur : actions publiques de réservation (création,
 * annulation/action par token, rate limiting) et aux routes cron.
 * Ne jamais importer depuis un Client Component.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
