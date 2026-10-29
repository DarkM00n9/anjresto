import type { PropsWithChildren } from "react";
import Link from "next/link";
import { FileText, Plus, ShieldCheck } from "lucide-react";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { ButtonLink } from "@/components/ui/Button";

export function SuperadminShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <header className="sticky top-0 z-30 print:hidden border-b border-slate-950 bg-slate-900 px-4 py-3 shadow-lg shadow-slate-900/20 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/superadmin" className="flex items-center gap-3 font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-900/15">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block">ANJ Agency</span><span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-300">Superadmin</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ButtonLink href="/superadmin/devis" variant="outline" size="sm" icon={<FileText className="h-4 w-4" />}>Devis</ButtonLink>
          <ButtonLink href="/superadmin/nouveau" variant="accent" size="sm" icon={<Plus className="h-4 w-4" />}><span className="hidden sm:inline">Nouveau restaurant</span><span className="sm:hidden">Nouveau</span></ButtonLink>
          <SignOutButton redirectTo="/superadmin/login" tone="dark" />
        </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl">{children}</main>
    </div>
  );
}
