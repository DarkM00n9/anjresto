import { requireAdminContext } from "@/app/admin/actions/guard";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { createClient } from "@/lib/supabase/server";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";
import { ClientsList, type ClientSummary } from "@/components/admin/ClientsList";
import type { CustomerNote } from "@/types/database";

export default async function ClientsPage() {
  await requireAdminContext();
  const restaurant = await requireCurrentRestaurant();
  const supabase = await createClient();
  const [{ data: reservations }, { data: notes }] = await Promise.all([
    supabase
      .from("reservations")
      .select("customer_name, customer_phone, customer_email, party_size, reservation_date, reservation_time, status")
      .eq("restaurant_id", restaurant.id)
      .order("reservation_date", { ascending: false })
      .order("reservation_time", { ascending: false }),
    supabase.from("customer_notes").select("*").eq("restaurant_id", restaurant.id),
  ]);

  const noteByPhone = new Map(((notes ?? []) as CustomerNote[]).map((n) => [n.phone, n]));
  const clients = new Map<string, ClientSummary>();

  // Les réservations arrivent de la plus récente à la plus ancienne.
  for (const r of reservations ?? []) {
    if (r.status === "cancelled" || r.status === "refused") continue;
    const c: ClientSummary =
      clients.get(r.customer_phone) ??
      {
        phone: r.customer_phone,
        name: r.customer_name,
        email: r.customer_email,
        visits: 0,
        noShows: 0,
        lastVisit: r.reservation_date,
        note: noteByPhone.get(r.customer_phone)?.note ?? "",
        isVip: noteByPhone.get(r.customer_phone)?.is_vip ?? false,
        history: [],
      };
    if (r.status === "no_show") c.noShows += 1;
    else c.visits += 1;
    if (c.history.length < 5) {
      c.history.push({ date: r.reservation_date, time: r.reservation_time.slice(0, 5), partySize: r.party_size, status: r.status });
    }
    clients.set(r.customer_phone, c);
  }

  const list = [...clients.values()].sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));

  return (
    <AdminPage>
      <AdminPageHeader title="Mes clients" description="Retrouve un client, ses visites, ses notes et marque tes VIP." />
      <ClientsList clients={list} />
    </AdminPage>
  );
}
