/**
 * Crée (ou retrouve) un compte Auth Supabase et le relie en tant que
 * `superadmin`, pour pouvoir se connecter à /superadmin par magic link.
 * Usage : npx tsx scripts/create-superadmin.ts <email>
 * Nécessite SUPABASE_SERVICE_ROLE_KEY dans .env.local.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env.local.");
  process.exit(1);
}

const [email] = process.argv.slice(2);

if (!email) {
  console.error("Usage : npx tsx scripts/create-superadmin.ts <email>");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  let userId: string;
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers.users.find((u) => u.email === email);

  if (existing) {
    userId = existing.id;
    console.log(`Compte Auth existant réutilisé pour ${email}.`);
  } else {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createError || !created.user) throw createError;
    userId = created.user.id;
    console.log(`Compte Auth créé pour ${email}.`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, role: "superadmin", restaurant_id: null }, { onConflict: "id" });

  if (profileError) throw profileError;

  console.log(`\n✅ ${email} est maintenant superadmin.`);
  console.log(`→ Connecte-toi sur /superadmin/login avec cet email pour recevoir le lien magique.`);
}

main().catch((error) => {
  console.error("Erreur :", error.message ?? error);
  process.exit(1);
});
