"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Accueil", icon: "🏠" },
  { href: "/admin/carte", label: "Ma carte", icon: "📋" },
  { href: "/admin/menu-du-jour", label: "Jour", icon: "☀️" },
  { href: "/admin/horaires", label: "Horaires", icon: "🕒" },
  { href: "/admin/infos", label: "Infos", icon: "ℹ️" },
  { href: "/admin/qr-code", label: "QR code", icon: "📱" },
];

export function BottomNav() {
  const pathname = usePathname();
  // En local, l'URL peut conserver le préfixe /r/{slug} : on le retire pour comparer.
  const path = pathname.replace(/^\/r\/[^/]+/, "") || "/";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around overflow-x-auto border-t border-neutral-200 bg-white px-1 py-1">
      {ITEMS.map((item) => {
        const active = item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-[60px] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium ${
              active ? "bg-black/5 text-[var(--color-primary,#C8553D)]" : "text-neutral-500"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
