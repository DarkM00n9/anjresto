import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Connexion — Superadmin",
  robots: { index: false, follow: false },
};

export default async function SuperadminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-200 px-4">
      <div className="w-full max-w-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold text-neutral-900">ANJ Agency</h1>
        <p className="mt-1 text-center text-sm text-slate-700">Superadmin</p>

        {error === "acces-refuse" && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-700">
            Ce compte n&apos;a pas d&apos;accès superadmin.
          </p>
        )}

        <Card className="mt-6">
          <LoginForm />
        </Card>
      </div>
    </main>
  );
}
