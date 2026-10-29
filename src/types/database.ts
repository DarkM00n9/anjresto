// Types manuels correspondant au schéma Supabase (supabase/migrations/0001_init.sql).
// À remplacer par `supabase gen types typescript` une fois le projet lié à la CLI.

export type AppRole = "superadmin" | "owner" | "manager" | "staff";

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

export type RestaurantStatus = "demo" | "active" | "suspended";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "refused"
  | "cancelled"
  | "seated"
  | "no_show";

export type ReservationSource = "online" | "phone";

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
  status: RestaurantStatus;
  name: string;
  tagline: string | null;
  description: string | null;
  tagline_en?: string | null;
  description_en?: string | null;
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
  google_reviews_url: string | null;
  google_rating: number | null;
  google_reviews_count: number | null;
  subscription_status: "trial" | "paid" | "unpaid";
  paid_until: string | null;
  monthly_price: number;
  created_at: string;
  updated_at: string;
}

export interface WaitlistEntry {
  id: string;
  restaurant_id: string;
  wanted_date: string;
  party_size: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  status: "waiting" | "notified" | "done";
  created_at: string;
}

export interface CustomerNote {
  restaurant_id: string;
  phone: string;
  note: string | null;
  is_vip: boolean;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  name_en?: string | null;
  description_en?: string | null;
  display_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  name_en?: string | null;
  description_en?: string | null;
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
  cancellation_token: string;
  action_token: string;
  source: ReservationSource;
  consent: boolean;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
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
  title_en?: string | null;
  starter_en?: string | null;
  main_en?: string | null;
  dessert_en?: string | null;
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

export interface ReservationSettings {
  restaurant_id: string;
  slot_interval_minutes: 15 | 30;
  max_covers_per_slot: number;
  total_seats: number;
  meal_duration_minutes: number;
  last_booking_before_close_minutes: number;
  max_party_size_online: number;
  min_advance_hours: number;
  max_advance_days: number;
  auto_confirm: boolean;
  updated_at: string;
}

export interface BlockedService {
  id: string;
  restaurant_id: string;
  date: string; // "YYYY-MM-DD"
  opens_at: string; // "HH:MM:SS"
  closes_at: string;
  created_at: string;
}

export interface ImpersonationLog {
  id: string;
  superadmin_id: string;
  restaurant_id: string;
  created_at: string;
}
