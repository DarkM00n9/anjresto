import Link from "next/link";
import Image from "next/image";
import type { Restaurant } from "@/types/database";

export function SiteHeader({ restaurant }: { restaurant: Restaurant }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {restaurant.logo_url && (
            <Image
              src={restaurant.logo_url}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <span className="font-[family-name:var(--font-title)] text-lg font-semibold text-[var(--color-secondary)]">
            {restaurant.name}
          </span>
        </Link>
      </div>
    </header>
  );
}
