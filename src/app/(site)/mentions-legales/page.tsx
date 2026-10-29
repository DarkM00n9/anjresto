import type { Metadata } from "next";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { getT } from "@/lib/lang";
import { LegalPage } from "@/components/site/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await requireCurrentRestaurant();
  const t = await getT();
  return { title: `${t("Mentions légales")} — ${restaurant.name}` };
}

export default async function MentionsLegalesPage() {
  const restaurant = await requireCurrentRestaurant();
  const t = await getT();

  return (
    <LegalPage eyebrow={t("Informations")} title={t("Mentions légales")}>
      <p>
        {t("Le présent site est édité par")} {restaurant.legal_name ?? restaurant.name}
        {restaurant.siret && <> — SIRET : {restaurant.siret}</>}.
      </p>
      {restaurant.legal_representative && <p>{t("Représentant légal :")} {restaurant.legal_representative}.</p>}
      {restaurant.address_line && (
        <p>
          {t("Siège :")} {restaurant.address_line}, {restaurant.postal_code} {restaurant.city}.
        </p>
      )}
      {restaurant.email && (
        <p>
          {t("Contact :")} {restaurant.email}
          {restaurant.phone && ` — ${restaurant.phone}`}.
        </p>
      )}
      <p>{t("Hébergement :")} Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA.</p>
      <p>{t("Conception du site :")} ANJ Agency (Marseille / PACA).</p>
    </LegalPage>
  );
}
