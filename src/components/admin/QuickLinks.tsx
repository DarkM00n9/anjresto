import Link from "next/link";

const LINKS = [
  { href: "/admin/carte", label: "Modifier ma carte", icon: "📋" },
  { href: "/admin/menu-du-jour", label: "Menu du jour", icon: "☀️" },
  { href: "/admin/horaires", label: "Horaires", icon: "🕒" },
];

export function QuickLinks() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm active:scale-95"
        >
          <span className="text-2xl">{link.icon}</span>
          <span className="font-medium text-neutral-900">{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
