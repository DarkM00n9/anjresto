import { requireSuperadmin } from "@/lib/auth";
import { SuperadminShell } from "@/components/superadmin/SuperadminShell";

export default async function ProtectedSuperadminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperadmin();
  return <SuperadminShell>{children}</SuperadminShell>;
}
