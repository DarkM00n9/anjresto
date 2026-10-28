import Link from "next/link";
import type { Restaurant } from "@/types/database";

export function SiteFooter({ restaurant }: { restaurant: Restaurant }) {
  return (
    <footer className="border-t border-black/5 bg-black/[0.02] py-10 text-sm text-black/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 text-center sm:px-6">
        <p className="font-semibold text-black/80">{restaurant.name}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="hover:underline">
            Accueil
          </Link>
          <Link href="/carte" className="hover:underline">
            Carte
          </Link>
          <Link href="/mentions-legales" className="hover:underline">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:underline">
            Politique de confidentialité
          </Link>
        </div>
        <p>
          © {new Date().getFullYear()} {restaurant.name}. Tous droits réservés.
        </p>
        <p className="text-xs text-black/40">Site propulsé par ANJ Agency</p>
      </div>
    </footer>
  );
}
