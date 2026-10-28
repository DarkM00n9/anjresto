import type { Metadata } from "next";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getReservationSettings } from "@/lib/get-reservations";
import { Section } from "@/components/ui/Section";
import { ReservationForm } from "@/components/reservation/ReservationForm";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await requireCurrentRestaurant();
  return { title: `Réserver une table — ${restaurant.name}` };
}

export default async function ReservationPage() {
  const restaurant = await requireCurrentRestaurant();
  const settings = await getReservationSettings(restaurant.id);

  return (
    <Section spacing="py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="font-[family-name:var(--font-title)] text-3xl font-bold text-[var(--color-secondary)]">
          Réserver une table
        </h1>
        <p className="mt-2 text-sm text-black/60">{restaurant.name}</p>
        <div className="mt-8">
          <ReservationForm restaurantId={restaurant.id} settings={settings} restaurantPhone={restaurant.phone} />
        </div>
      </div>
    </Section>
  );
}
