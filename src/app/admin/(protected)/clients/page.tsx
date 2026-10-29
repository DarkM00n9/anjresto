import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { createClient } from "@/lib/supabase/server";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";
import { ClientCard } from "@/components/admin/ClientCard";
import type { CustomerNote } from "@/types/database";

export default async function ClientsPage() {
  const restaurant = await requireCurrentRestaurant();
  const supabase = await createClient();
  const [{ data: reservations }, { data: notes }] = await Promise.all([
    supabase
      .from("reservations")
      .select("customer_name, customer_phone, reservation_date, status")
      .eq("restaurant_id", restaurant.id)
      .order("reservation_date", { ascending: false }),
    supabase.from("customer_notes").select("*").eq("restaurant_id", restaurant.id),
  ]);

  const noteByPhone = new Map(((notes ?? []) as CustomerNote[]).map((n) => [n.phone, n]));
  const clients = new Map<string, { name: string; phone: string; visits: number; noShows: number; last: string }>();
  for (const r of reservations ?? []) {
    if (r.status === "cancelled" || r.status === "refused") continue;
    const c = clients.get(r.customer_phone) ?? { name: r.customer_name, phone: r.customer_phone, visits: 0, noShows: 0, last: r.reservation_date };
    if (r.status === "no_show") c.noShows += 1;
    else c.visits += 1;
    clients.set(r.customer_phone, c);
  }

  const list = [...clients.values()].sort((a, b) => b.visits - a.visits);

  return (
    <AdminPage>
      <AdminPageHeader title="Mes clients" description="Historique des visites, notes et clients VIP." />
      {list.length === 0 && <p className="text-sm text-slate-700">Aucun client pour l&apos;instant.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((c) => {
          const n = noteByPhone.get(c.phone);
          return (
            <ClientCard
              key={c.phone}
              name={c.name}
              phone={c.phone}
              visits={c.visits}
              noShows={c.noShows}
              lastVisit={c.last}
              note={n?.note ?? ""}
              isVip={n?.is_vip ?? false}
            />
          );
        })}
      </div>
    </AdminPage>
  );
}
