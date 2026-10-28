import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { buildPublicCarteUrl } from "@/lib/qr";
import { QrCodeGenerator } from "@/components/admin/QrCodeGenerator";

export default async function AdminQrCodePage() {
  const restaurant = await requireCurrentRestaurant();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
  const carteUrl = buildPublicCarteUrl(restaurant, rootDomain);

  return (
    <div>
      <div className="border-b border-neutral-200 bg-white px-4 py-3">
        <h1 className="text-base font-semibold text-neutral-900">QR code</h1>
      </div>
      <QrCodeGenerator restaurant={restaurant} carteUrl={carteUrl} />
    </div>
  );
}
