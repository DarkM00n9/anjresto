import type { PropsWithChildren } from "react";
import Image from "next/image";
import type { AppRole, Restaurant } from "@/types/database";
import { BottomNav } from "./BottomNav";
import { SignOutButton } from "./SignOutButton";
import { NewReservationAlert } from "./NewReservationAlert";
import { Badge } from "@/components/ui/Badge";

interface AdminShellProps extends PropsWithChildren {
  restaurant: Restaurant;
  role: AppRole;
}

export function AdminShell({ restaurant, role, children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-200">
      <header className="sticky top-0 z-30 border-b border-slate-950 bg-slate-900 px-4 py-3 shadow-lg shadow-slate-900/20 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {restaurant.logo_url ? (
            <Image
              src={restaurant.logo_url}
              alt=""
              width={32}
              height={32}
              className="h-9 w-9 rounded-full border border-slate-600 object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm shadow-indigo-900/10">
              {restaurant.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white sm:text-base">{restaurant.name}</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-300">Administration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex">
            <Badge tone="info">ANJ Agency</Badge>
          </span>
          <NewReservationAlert />
          <SignOutButton tone="dark" />
        </div>
        </div>
      </header>
      <main className="page-enter mx-auto flex w-full max-w-6xl flex-1 flex-col pb-24">{children}</main>
      <BottomNav role={role} />
    </div>
  );
}
