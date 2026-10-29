import type { Metadata } from "next";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getT } from "@/lib/lang";
import { LegalPage } from "@/components/site/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await requireCurrentRestaurant();
  const t = await getT();
  return { title: `${t("Politique de confidentialité")} — ${restaurant.name}` };
}

export default async function ConfidentialitePage() {
  const restaurant = await requireCurrentRestaurant();
  const t = await getT();

  return (
    <LegalPage eyebrow={t("Vos données")} title={t("Politique de confidentialité")}>
      <p>
        {restaurant.name}{" "}
        {t("collecte uniquement les informations nécessaires au traitement de vos demandes de réservation (nom, téléphone, email le cas échéant, date et nombre de couverts).")}
      </p>
      <p>
        {t("Ces données sont conservées le temps nécessaire au traitement de votre réservation et ne sont jamais transmises à des tiers à des fins commerciales.")}
      </p>
      <p>
        {t("Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données en nous contactant")}{" "}
        {restaurant.email ? `${t("à")} ${restaurant.email}` : t("directement")}.
      </p>
      <p>{t("Ce site n'utilise pas de cookies de suivi publicitaire.")}</p>
    </LegalPage>
  );
}
