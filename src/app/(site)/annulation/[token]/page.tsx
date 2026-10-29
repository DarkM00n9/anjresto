import { notFound } from "next/navigation";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { createAdminClient } from "@/lib/supabase/admin";
import { getT } from "@/lib/lang";
import { LegalPage } from "@/components/site/LegalPage";
import { CancellationCard } from "@/components/reservation/CancellationCard";
import type { Reservation } from "@/types/database";

export default async function CancellationPage({ params }: { params: Promise<{ token: string }> }) {
  const restaurant = await requireCurrentRestaurant();
  const t = await getT();
  const { token } = await params;

  const supabase = createAdminClient();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("*")
    .eq("cancellation_token", token)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (!reservation) notFound();

  return (
    <LegalPage eyebrow={t("Votre réservation")} title={t("Annuler ma réservation")}>
      <p>{t("Vérifiez les détails avant de confirmer l’annulation.")}</p>
      <CancellationCard reservation={reservation as Reservation} />
    </LegalPage>
  );
}
