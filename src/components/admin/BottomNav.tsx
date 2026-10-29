"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, UtensilsCrossed, Sun, Clock, Info, QrCode, MoreHorizontal, Users, BarChart3, type LucideIcon } from "lucide-react";

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Accueil", icon: Home },
  { href: "/admin/reservations", label: "Résa.", icon: CalendarDays },
  { href: "/admin/carte", label: "Ma carte", icon: UtensilsCrossed },
  { href: "/admin/menu-du-jour", label: "Jour", icon: Sun },
  { href: "/admin/horaires", label: "Horaires", icon: Clock },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/statistiques", label: "Stats", icon: BarChart3 },
  { href: "/admin/infos", label: "Infos", icon: Info },
  { href: "/admin/qr-code", label: "QR code", icon: QrCode },
];

export function BottomNav() {
  const pathname = usePathname();
  // En local, l'URL peut conserver le préfixe /r/{slug} : on le retire pour comparer.
  const path = pathname.replace(/^\/r\/[^/]+/, "") || "/";
  const secondaryItems = ITEMS.slice(4);
  const secondaryActive = secondaryItems.some((item) => path.startsWith(item.href));

  return (
    <nav aria-label="Navigation d’administration" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-950 bg-slate-900 px-1 py-2 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.5)] sm:px-4 sm:py-3">
      <div className="mx-auto flex w-full max-w-4xl justify-between gap-1 sm:justify-center sm:gap-2">
      {ITEMS.map((item) => {
        const active = item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
        const isSecondary = secondaryItems.some((secondaryItem) => secondaryItem.href === item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${
              isSecondary
                ? "hidden min-w-[76px] shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:flex sm:gap-1.5"
                : "flex min-w-[54px] shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:min-w-[76px] sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs"
            } ${
              active ? "bg-indigo-500 text-white shadow-md shadow-indigo-900/40" : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={active ? 2.25 : 1.75} />
            {item.label}
          </Link>
        );
      })}
      <details className="relative shrink-0 sm:hidden">
        <summary
          aria-label="Plus de rubriques"
          className={`flex min-w-[54px] cursor-pointer list-none flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            secondaryActive ? "bg-indigo-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <MoreHorizontal className="h-[18px] w-[18px]" />
          Plus
        </summary>
        <div className="absolute bottom-full right-0 z-50 mb-3 flex min-w-[190px] flex-col gap-1 rounded-2xl border border-slate-300 bg-white p-2 shadow-xl shadow-slate-900/15">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const active = path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={(event) => {
                  const details = event.currentTarget.closest("details");
                  if (details) details.open = false;
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  active ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </details>
      </div>
    </nav>
  );
}
