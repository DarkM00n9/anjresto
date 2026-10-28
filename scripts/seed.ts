/**
 * Script de seed : crée (ou réinitialise) le restaurant de démo "Chez Marius".
 * Usage : npm run seed
 * Nécessite SUPABASE_SERVICE_ROLE_KEY (contourne la RLS) dans .env.local.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const RESTAURANT_SLUG = "chez-marius";

async function seed() {
  const { data: existing } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", RESTAURANT_SLUG)
    .maybeSingle();

  if (existing) {
    console.log("Suppression de l'ancien jeu de données 'chez-marius'...");
    await supabase.from("restaurants").delete().eq("id", existing.id);
  }

  console.log("Création du restaurant 'Chez Marius'...");
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .insert({
      slug: RESTAURANT_SLUG,
      is_published: true,
      name: "Chez Marius",
      tagline: "Cuisine provençale, produits du marché",
      description:
        "Depuis 1998, Chez Marius vous accueille dans une ambiance chaleureuse à deux pas du Vieux-Port de Marseille.\n\nÀ chaque saison son marché, à chaque marché notre carte : des produits frais, locaux, et une cuisine généreuse et sans chichis.",
      cuisine_type: "Provençale",
      cover_image_url:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80",
      logo_url: "https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=200&q=80",
      gallery_urls: [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
        "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80",
        "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
      ],
      phone: "04 91 00 00 00",
      email: "contact@chezmarius-marseille.fr",
      address_line: "12 Quai du Port",
      postal_code: "13002",
      city: "Marseille",
      latitude: 43.2965,
      longitude: 5.3698,
      instagram_url: "https://instagram.com/chezmarius",
      facebook_url: "https://facebook.com/chezmarius",
      legal_name: "SARL Chez Marius",
      siret: "123 456 789 00012",
      legal_representative: "Marius Fontaine",
      theme: {
        primary_color: "#C8553D",
        secondary_color: "#2E4057",
        font_title: "Playfair Display",
        layout_style: "bistrot_chaleureux",
      },
    })
    .select()
    .single();

  if (restaurantError || !restaurant) throw restaurantError;

  const categoriesData = [
    { name: "Entrées", description: "Pour commencer en douceur", display_order: 0 },
    { name: "Poissons & fruits de mer", description: "Pêche du jour", display_order: 1 },
    { name: "Viandes", description: "Grillées au feu de bois", display_order: 2 },
    { name: "Plats végétariens", description: "Légumes du marché", display_order: 3 },
    { name: "Desserts", description: "Faits maison", display_order: 4 },
  ];

  console.log("Création des catégories...");
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .insert(categoriesData.map((c) => ({ ...c, restaurant_id: restaurant.id })))
    .select();

  if (categoriesError || !categories) throw categoriesError;

  const categoryId = (name: string) => categories.find((c) => c.name === name)!.id;

  interface RawMenuItem {
    category: string;
    name: string;
    description: string;
    price: number;
    is_daily_special?: boolean;
    is_vegetarian?: boolean;
    is_vegan?: boolean;
    is_gluten_free?: boolean;
    is_spicy?: boolean;
    is_homemade?: boolean;
    allergens: string[];
  }

  const rawItems: RawMenuItem[] = [
    { category: "Entrées", name: "Soupe au pistou", description: "Légumes de saison, basilic, parmesan", price: 9.5, is_vegetarian: true, is_homemade: true, allergens: ["lait"] },
    { category: "Entrées", name: "Tapenade maison & pain grillé", description: "Olives noires de Provence", price: 7.5, is_vegan: true, is_vegetarian: true, is_homemade: true, allergens: ["gluten"] },
    { category: "Entrées", name: "Salade de chèvre chaud", description: "Miel de lavande, noix", price: 11, is_vegetarian: true, allergens: ["lait", "fruits_a_coque", "gluten"] },
    { category: "Entrées", name: "Anchoïade & légumes croquants", description: "Anchois de Collioure", price: 10, allergens: ["poissons"] },
    { category: "Entrées", name: "Terrine de campagne maison", description: "Pain de campagne, cornichons", price: 9, is_homemade: true, allergens: ["gluten"] },

    { category: "Poissons & fruits de mer", name: "Bouillabaisse traditionnelle", description: "Poissons de roche, rouille, croûtons", price: 32, is_daily_special: true, allergens: ["poissons", "crustaces", "gluten", "oeufs"] },
    { category: "Poissons & fruits de mer", name: "Loup grillé entier", description: "Fenouil confit, huile d'olive", price: 28, allergens: ["poissons"] },
    { category: "Poissons & fruits de mer", name: "Moules de Camargue marinière", description: "Vin blanc, ail, persil", price: 18, allergens: ["mollusques", "sulfites"] },
    { category: "Poissons & fruits de mer", name: "Tartare de daurade", description: "Agrumes, huile d'olive citronnée", price: 19, allergens: ["poissons"] },
    { category: "Poissons & fruits de mer", name: "Gambas flambées au pastis", description: "Beurre à l'ail", price: 22, allergens: ["crustaces", "lait", "sulfites"] },

    { category: "Viandes", name: "Daube provençale", description: "Mijotée 12h, vin rouge, olives", price: 24, is_daily_special: true, is_homemade: true, allergens: ["sulfites"] },
    { category: "Viandes", name: "Côte de bœuf grillée (pour 2)", description: "Sel de Camargue, pommes grenaille", price: 58, allergens: [] },
    { category: "Viandes", name: "Agneau de Sisteron rôti", description: "Thym, ail confit", price: 29, allergens: [] },
    { category: "Viandes", name: "Magret de canard", description: "Miel de lavande, figues", price: 26, allergens: [] },
    { category: "Viandes", name: "Poulet fermier rôti", description: "Jus corsé, légumes de saison", price: 21, allergens: [] },

    { category: "Plats végétariens", name: "Ratatouille niçoise & riz camarguais", description: "Légumes mijotés, basilic frais", price: 17, is_vegan: true, is_vegetarian: true, is_gluten_free: true, is_homemade: true, allergens: [] },
    { category: "Plats végétariens", name: "Risotto aux champignons de saison", description: "Parmesan, huile de truffe", price: 19, is_vegetarian: true, allergens: ["lait"] },
    { category: "Plats végétariens", name: "Tarte fine aux légumes du marché", description: "Pâte feuilletée maison", price: 16, is_vegetarian: true, is_homemade: true, allergens: ["gluten", "lait", "oeufs"] },
    { category: "Plats végétariens", name: "Panisse & houmous maison", description: "Pois chiche, cumin", price: 14, is_vegan: true, is_vegetarian: true, is_gluten_free: true, allergens: [] },
    { category: "Plats végétariens", name: "Socca niçoise", description: "Farine de pois chiche, poivre", price: 10, is_vegan: true, is_vegetarian: true, is_gluten_free: true, allergens: [] },

    { category: "Desserts", name: "Tarte au citron de Menton", description: "Meringue italienne", price: 8.5, is_vegetarian: true, is_homemade: true, allergens: ["gluten", "lait", "oeufs"] },
    { category: "Desserts", name: "Calisson glacé maison", description: "Amandes, melon confit", price: 9, is_vegetarian: true, is_homemade: true, allergens: ["fruits_a_coque", "oeufs", "lait"] },
    { category: "Desserts", name: "Fondant au chocolat", description: "Cœur coulant, crème anglaise", price: 9.5, is_vegetarian: true, is_homemade: true, allergens: ["gluten", "lait", "oeufs"] },
    { category: "Desserts", name: "Fromages affinés de la région", description: "Sélection du fromager", price: 10, is_vegetarian: true, allergens: ["lait"] },
    { category: "Desserts", name: "Sorbet trois parfums", description: "Fabrication artisanale", price: 7, is_vegan: true, is_vegetarian: true, is_gluten_free: true, allergens: [] },
  ];

  const items = rawItems.map((item, index) => ({
    restaurant_id: restaurant.id,
    category_id: categoryId(item.category),
    name: item.name,
    description: item.description,
    price: item.price,
    is_available: true,
    is_daily_special: item.is_daily_special ?? false,
    is_vegetarian: item.is_vegetarian ?? false,
    is_vegan: item.is_vegan ?? false,
    is_gluten_free: item.is_gluten_free ?? false,
    is_spicy: item.is_spicy ?? false,
    is_homemade: item.is_homemade ?? false,
    allergens: item.allergens ?? [],
    display_order: index,
  }));

  console.log(`Création de ${items.length} plats...`);
  const { error: itemsError } = await supabase.from("menu_items").insert(items);
  if (itemsError) throw itemsError;

  // Un plat épuisé pour tester le masquage sur la carte.
  await supabase
    .from("menu_items")
    .update({ is_available: false })
    .eq("restaurant_id", restaurant.id)
    .eq("name", "Côte de bœuf grillée (pour 2)");

  console.log("Création des horaires (fermé le lundi)...");
  const openDays = [0, 2, 3, 4, 5, 6]; // 0 = dimanche ... fermé le lundi (1)
  const hours = openDays.flatMap((day) => [
    { restaurant_id: restaurant.id, day_of_week: day, opens_at: "12:00", closes_at: "14:30", is_closed: false },
    { restaurant_id: restaurant.id, day_of_week: day, opens_at: "19:00", closes_at: "22:30", is_closed: false },
  ]);

  const { error: hoursError } = await supabase.from("opening_hours").insert(hours);
  if (hoursError) throw hoursError;

  console.log("\n✅ Seed terminé !");
  console.log(`→ Tester en local : http://localhost:3000/r/${RESTAURANT_SLUG}`);
}

seed().catch((error) => {
  console.error("Erreur pendant le seed :", error);
  process.exit(1);
});
