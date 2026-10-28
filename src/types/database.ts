// Types manuels correspondant au schéma Supabase (supabase/migrations/0001_init.sql).
// À remplacer par `supabase gen types typescript` une fois le projet lié à la CLI.

export type AppRole = "superadmin" | "owner";

export type Allergen =
  | "gluten"
  | "crustaces"
  | "oeufs"
  | "poissons"
  | "arachides"
  | "soja"
  | "lait"
  | "fruits_a_coque"
  | "celeri"
  | "moutarde"
  | "sesame"
  | "sulfites"
  | "lupin"
  | "mollusques";

export type LayoutStyle =
  | "bistrot_chaleureux"
  | "moderne_epure"
  | "mediterraneen";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "no_show";

export interface RestaurantTheme {
  primary_color: string;
  secondary_color: string;
  font_title: string;
  layout_style: LayoutStyle;
}

export interface Restaurant {
  id: string;
  slug: string;
  custom_domain: string | null;
  is_published: boolean;
  name: string;
  tagline: string | null;
  description: string | null;
  cuisine_type: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  gallery_urls: string[];
  phone: string | null;
  email: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  instagram_url: string | null;
  facebook_url: string | null;
  legal_name: string | null;
  siret: string | null;
  legal_representative: string | null;
  theme: RestaurantTheme;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  is_available: boolean;
  is_daily_special: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_spicy: boolean;
  is_homemade: boolean;
  allergens: Allergen[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OpeningHour {
  id: string;
  restaurant_id: string;
  day_of_week: number; // 0 = dimanche ... 6 = samedi
  opens_at: string | null; // "HH:MM:SS"
  closes_at: string | null;
  is_closed: boolean;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: ReservationStatus;
  notes: string | null;
  created_at: string;
}

export interface MenuItemWithCategory extends MenuItem {
  category: Pick<Category, "id" | "name" | "display_order">;
}

export interface DailyMenu {
  id: string;
  restaurant_id: string;
  title: string;
  starter: string | null;
  main: string | null;
  dessert: string | null;
  price: number;
  valid_date: string; // "YYYY-MM-DD"
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Closure {
  id: string;
  restaurant_id: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string;
  message: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  role: AppRole;
  restaurant_id: string | null;
  full_name: string | null;
  created_at: string;
}
