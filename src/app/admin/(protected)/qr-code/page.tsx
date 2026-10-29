import { requireAdminContext } from "@/app/admin/actions/guard";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { buildPublicCarteUrl } from "@/lib/qr";
import { QrCodeGenerator } from "@/components/admin/QrCodeGenerator";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default async function AdminQrCodePage() {
  await requireAdminContext();
  const restaurant = await requireCurrentRestaurant();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
  const carteUrl = buildPublicCarteUrl(restaurant, rootDomain);

  return (
    <AdminPage width="narrow">
      <AdminPageHeader title="QR code" description="Télécharge un QR code prêt à imprimer pour donner accès à ta carte." />
      <QrCodeGenerator restaurant={restaurant} carteUrl={carteUrl} />
    </AdminPage>
  );
}
