import { requireAdminContext } from "@/app/admin/actions/guard";
import { OWNER_ONLY } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";
import { TeamManager, type TeamMember } from "@/components/admin/TeamManager";

export default async function TeamPage() {
  const { restaurant } = await requireAdminContext(OWNER_ONLY);
  const admin = createAdminClient();
  const [{ data: profiles }, { data: users }] = await Promise.all([
    admin.from("profiles").select("id, role, full_name").eq("restaurant_id", restaurant.id),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const emails = new Map(users.users.map((u) => [u.id, u.email ?? null]));

  const members: TeamMember[] = (profiles ?? []).map((p) => ({
    id: p.id,
    email: emails.get(p.id) ?? null,
    full_name: p.full_name,
    role: p.role as TeamMember["role"],
  }));
  members.sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0));

  return (
    <AdminPage width="narrow">
      <AdminPageHeader title="Équipe" description="Invite ton gérant ou tes employés et choisis ce qu'ils peuvent faire." />
      <TeamManager members={members} />
    </AdminPage>
  );
}
