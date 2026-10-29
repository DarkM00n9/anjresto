import type { Restaurant } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Download, FileDown, QrCode } from "lucide-react";

export function QrCodeGenerator({ restaurant, carteUrl }: { restaurant: Restaurant; carteUrl: string }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5">
      <Card className="flex w-full flex-col items-center bg-gradient-to-b from-white to-slate-50/70 px-6 py-8 sm:p-9">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><QrCode className="h-4 w-4" /></span>
          Aperçu du QR code
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white p-4 shadow-lg shadow-slate-900/5">
        {/* Image générée dynamiquement par une route handler, pas un asset next/image classique. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/admin/qr-code/png" alt={`QR code vers la carte de ${restaurant.name}`} width={240} height={240} />
        </div>
        <p className="mt-4 max-w-full break-all text-center text-xs leading-5 text-slate-700">{carteUrl}</p>
      </Card>

      <div className="grid w-full gap-3 sm:grid-cols-2">
        <ButtonLink href="/admin/qr-code/png" download="qr-code.png" variant="accent" size="lg" icon={<Download className="h-4 w-4" />} className="w-full">Télécharger en PNG</ButtonLink>
        <ButtonLink href="/admin/qr-code/pdf" download="chevalet-qr-code.pdf" variant="outline-accent" size="lg" icon={<FileDown className="h-4 w-4" />} className="w-full">Chevalet PDF</ButtonLink>
      </div>
    </div>
  );
}
