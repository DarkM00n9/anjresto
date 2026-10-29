import { CreateRestaurantForm } from "@/components/superadmin/CreateRestaurantForm";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default function NewRestaurantPage() {
  return (
    <AdminPage width="narrow">
      <AdminPageHeader eyebrow="Superadmin" title="Nouveau restaurant" description="Crée l’espace de l’établissement et prépare sa première page publique." backHref="/superadmin" backLabel="Tous les restaurants" />
      <CreateRestaurantForm />
    </AdminPage>
  );
}
