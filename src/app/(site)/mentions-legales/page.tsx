import type { Metadata } from "next";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { Section } from "@/components/ui/Section";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await requireCurrentRestaurant();
  return { title: `Mentions légales — ${restaurant.name}` };
}

export default async function MentionsLegalesPage() {
  const restaurant = await requireCurrentRestaurant();

  return (
    <Section spacing="py-16">
      <h1 className="font-[family-name:var(--font-title)] text-3xl font-bold text-[var(--color-secondary)]">
        Mentions légales
      </h1>
      <div className="mt-6 space-y-4 text-sm text-stone-700">
        <p>
          Le présent site est édité par {restaurant.legal_name ?? restaurant.name}
          {restaurant.siret && <> — SIRET : {restaurant.siret}</>}.
        </p>
        {restaurant.legal_representative && (
          <p>Représentant légal : {restaurant.legal_representative}.</p>
        )}
        {restaurant.address_line && (
          <p>
            Siège : {restaurant.address_line}, {restaurant.postal_code} {restaurant.city}.
          </p>
        )}
        {restaurant.email && (
          <p>
            Contact : {restaurant.email}
            {restaurant.phone && ` — ${restaurant.phone}`}.
          </p>
        )}
        <p>Hébergement : Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA.</p>
        <p>Conception du site : ANJ Agency (Marseille / PACA).</p>
      </div>
    </Section>
  );
}
