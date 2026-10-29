import { notFound } from "next/navigation";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { createAdminClient } from "@/lib/supabase/admin";
import { Section } from "@/components/ui/Section";
import { CancellationCard } from "@/components/reservation/CancellationCard";
import type { Reservation } from "@/types/database";

export default async function CancellationPage({ params }: { params: Promise<{ token: string }> }) {
  const restaurant = await requireCurrentRestaurant();
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
    <Section spacing="py-12 md:py-20" className="bg-stone-200/70">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">Votre réservation</p>
        <h1 className="mt-2 font-[family-name:var(--font-title)] text-3xl font-bold text-[var(--color-secondary)] sm:text-4xl">Annuler ma réservation</h1>
        <p className="mt-2 text-sm text-stone-700">Vérifiez les détails avant de confirmer l’annulation.</p>
        <div className="mt-6">
          <CancellationCard reservation={reservation as Reservation} />
        </div>
      </div>
    </Section>
  );
}
