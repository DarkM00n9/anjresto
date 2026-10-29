import type { Metadata } from "next";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { Section } from "@/components/ui/Section";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await requireCurrentRestaurant();
  return { title: `Politique de confidentialité — ${restaurant.name}` };
}

export default async function ConfidentialitePage() {
  const restaurant = await requireCurrentRestaurant();

  return (
    <Section spacing="py-16">
      <h1 className="font-[family-name:var(--font-title)] text-3xl font-bold text-[var(--color-secondary)]">
        Politique de confidentialité
      </h1>
      <div className="mt-6 space-y-4 text-sm text-stone-700">
        <p>
          {restaurant.name} collecte uniquement les informations nécessaires au traitement de vos
          demandes de réservation (nom, téléphone, email le cas échéant, date et nombre de couverts).
        </p>
        <p>
          Ces données sont conservées le temps nécessaire au traitement de votre réservation et ne
          sont jamais transmises à des tiers à des fins commerciales.
        </p>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
          d&apos;un droit d&apos;accès, de rectification et de suppression de vos données en nous
          contactant{restaurant.email ? <> à {restaurant.email}</> : " directement"}.
        </p>
        <p>Ce site n&apos;utilise pas de cookies de suivi publicitaire.</p>
      </div>
    </Section>
  );
}
