import type { Restaurant } from "@/types/database";

export function QrCodeGenerator({ restaurant, carteUrl }: { restaurant: Restaurant; carteUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        {/* Image générée dynamiquement par une route handler, pas un asset next/image classique. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/admin/qr-code/png" alt={`QR code vers la carte de ${restaurant.name}`} width={240} height={240} />
      </div>
      <p className="break-all text-center text-xs text-neutral-500">{carteUrl}</p>

      <div className="flex w-full flex-col gap-3">
        <a
          href="/admin/qr-code/png"
          download="qr-code.png"
          className="w-full rounded-xl bg-neutral-900 px-4 py-4 text-center text-lg font-semibold text-white"
        >
          Télécharger en PNG
        </a>
        <a
          href="/admin/qr-code/pdf"
          download="chevalet-qr-code.pdf"
          className="w-full rounded-xl border-2 border-neutral-900 px-4 py-4 text-center text-lg font-semibold text-neutral-900"
        >
          Télécharger le chevalet (PDF)
        </a>
      </div>
    </div>
  );
}
