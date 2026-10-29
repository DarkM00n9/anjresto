import Link from "next/link";
import { CalendarDays, UtensilsCrossed, Sun, Clock, type LucideIcon } from "lucide-react";

const LINKS: { href: string; label: string; icon: LucideIcon; tone: string }[] = [
  { href: "/admin/reservations", label: "Réservations", icon: CalendarDays, tone: "bg-indigo-50 text-indigo-600" },
  { href: "/admin/carte", label: "Modifier ma carte", icon: UtensilsCrossed, tone: "bg-amber-50 text-amber-600" },
  { href: "/admin/menu-du-jour", label: "Menu du jour", icon: Sun, tone: "bg-orange-50 text-orange-600" },
  { href: "/admin/horaires", label: "Horaires", icon: Clock, tone: "bg-emerald-50 text-emerald-600" },
];

export function QuickLinks() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${link.tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-medium text-neutral-900">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
