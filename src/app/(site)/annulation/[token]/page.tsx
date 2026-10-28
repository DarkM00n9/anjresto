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
    <Section spacing="py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="font-[family-name:var(--font-title)] text-2xl font-bold text-[var(--color-secondary)]">
          Annuler ma réservation
        </h1>
        <div className="mt-6">
          <CancellationCard reservation={reservation as Reservation} />
        </div>
      </div>
    </Section>
  );
}
