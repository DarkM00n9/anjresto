import type { PropsWithChildren } from "react";
import type { Restaurant } from "@/types/database";
import { BottomNav } from "./BottomNav";
import { SignOutButton } from "./SignOutButton";

interface AdminShellProps extends PropsWithChildren {
  restaurant: Restaurant;
}

export function AdminShell({ restaurant, children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <span className="font-semibold text-neutral-900">{restaurant.name}</span>
        <SignOutButton />
      </header>
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
