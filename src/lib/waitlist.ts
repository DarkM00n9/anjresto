import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { waitlistSpotEmail } from "@/lib/email/templates";
import { buildPublicOrigin } from "@/lib/url";
import type { Restaurant, WaitlistEntry } from "@/types/database";

/** Prévient (par e-mail) les personnes en liste d'attente pour cette date qu'une place vient de se libérer. */
export async function notifyWaitlist(restaurant: Restaurant, date: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("waitlist")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("wanted_date", date)
    .eq("status", "waiting");

  const entries = (data ?? []) as WaitlistEntry[];
  if (entries.length === 0) return;
  const baseUrl = buildPublicOrigin(restaurant, process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "");

  for (const entry of entries) {
    if (entry.customer_email) {
      await sendEmail({ to: entry.customer_email, ...waitlistSpotEmail(restaurant, entry, baseUrl) });
    }
  }
  await supabase
    .from("waitlist")
    .update({ status: "notified" })
    .in("id", entries.map((e) => e.id));
}
