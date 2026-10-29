"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ redirectTo = "/admin/login", tone = "light" }: { redirectTo?: string; tone?: "light" | "dark" }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors ${tone === "dark" ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"}`}
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Déconnexion</span>
    </button>
  );
}
