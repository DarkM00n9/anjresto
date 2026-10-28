import { z } from "zod";

// Schémas partagés entre les formulaires client (react-hook-form) et les Server
// Actions (qui revalident tout côté serveur). Un seul fichier car les fichiers
// "use server" ne peuvent exporter que des fonctions async.

export const ALLERGEN_VALUES = [
  "gluten",
  "crustaces",
  "oeufs",
  "poissons",
  "arachides",
  "soja",
  "lait",
  "fruits_a_coque",
  "celeri",
  "moutarde",
  "sesame",
  "sulfites",
  "lupin",
  "mollusques",
] as const;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(80),
  description: z.string().trim().max(200).optional().or(z.literal("")),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const menuItemSchema = z.object({
  category_id: z.string().uuid("Choisis une catégorie"),
  name: z.string().trim().min(1, "Nom requis").max(100),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Le prix doit être positif").max(999.99),
  photo_url: z.string().optional().or(z.literal("")),
  is_vegetarian: z.boolean(),
  is_vegan: z.boolean(),
  is_gluten_free: z.boolean(),
  is_spicy: z.boolean(),
  is_homemade: z.boolean(),
  is_daily_special: z.boolean(),
  allergens: z.array(z.enum(ALLERGEN_VALUES)),
});
export type MenuItemInput = z.infer<typeof menuItemSchema>;
// z.coerce.number() rend le type "input" différent du type "output" (string|unknown -> number) :
// react-hook-form a besoin des deux pour typer correctement le formulaire et le submit.
export type MenuItemFormInput = z.input<typeof menuItemSchema>;

export const dailyMenuSchema = z.object({
  title: z.string().trim().min(1, "Titre requis").max(80),
  starter: z.string().trim().max(200).optional().or(z.literal("")),
  main: z.string().trim().max(200).optional().or(z.literal("")),
  dessert: z.string().trim().max(200).optional().or(z.literal("")),
  price: z.coerce.number().min(0).max(999.99),
  valid_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  is_active: z.boolean(),
});
export type DailyMenuInput = z.infer<typeof dailyMenuSchema>;
export type DailyMenuFormInput = z.input<typeof dailyMenuSchema>;

const serviceSlotSchema = z.object({
  opens_at: z.string().regex(/^\d{2}:\d{2}$/),
  closes_at: z.string().regex(/^\d{2}:\d{2}$/),
});

export const dayScheduleSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  is_closed: z.boolean(),
  slots: z.array(serviceSlotSchema).max(2, "2 services maximum par jour"),
});
export type DayScheduleInput = z.infer<typeof dayScheduleSchema>;

export const hoursFormSchema = z.object({
  days: z.array(dayScheduleSchema).length(7),
});
export type HoursFormInput = z.infer<typeof hoursFormSchema>;

export const closureSchema = z
  .object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
    message: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "La date de fin doit être après la date de début",
    path: ["end_date"],
  });
export type ClosureInput = z.infer<typeof closureSchema>;

export const restaurantInfoSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(100),
  tagline: z.string().trim().max(150).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Email invalide").optional().or(z.literal("")),
  address_line: z.string().trim().max(150).optional().or(z.literal("")),
  postal_code: z.string().trim().max(10).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  instagram_url: z.string().trim().max(300).optional().or(z.literal("")),
  facebook_url: z.string().trim().max(300).optional().or(z.literal("")),
  logo_url: z.string().optional().or(z.literal("")),
  cover_image_url: z.string().optional().or(z.literal("")),
  gallery_urls: z.array(z.string()).max(4),
});
export type RestaurantInfoInput = z.infer<typeof restaurantInfoSchema>;

export const reservationFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide"),
  party_size: z.coerce.number().int().min(1, "Au moins 1 personne").max(50),
  customer_name: z.string().trim().min(1, "Nom requis").max(100),
  customer_phone: z.string().trim().min(6, "Téléphone requis").max(30),
  customer_email: z.string().trim().email("Email invalide").optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v === true, { message: "Merci d'accepter l'utilisation de tes données" }),
});
export type ReservationFormInput = z.infer<typeof reservationFormSchema>;
export type ReservationFormValues = z.input<typeof reservationFormSchema>;

export const reservationSettingsSchema = z.object({
  slot_interval_minutes: z.coerce.number().refine((v) => v === 15 || v === 30, "15 ou 30 minutes"),
  max_covers_per_slot: z.coerce.number().int().min(1).max(500),
  max_party_size_online: z.coerce.number().int().min(1).max(50),
  min_advance_hours: z.coerce.number().int().min(0).max(168),
  max_advance_days: z.coerce.number().int().min(1).max(365),
  auto_confirm: z.boolean(),
});
export type ReservationSettingsInput = z.infer<typeof reservationSettingsSchema>;
export type ReservationSettingsFormValues = z.input<typeof reservationSettingsSchema>;

export const manualReservationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide"),
  party_size: z.coerce.number().int().min(1, "Au moins 1 personne").max(200),
  customer_name: z.string().trim().min(1, "Nom requis").max(100),
  customer_phone: z.string().trim().min(6, "Téléphone requis").max(30),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type ManualReservationInput = z.infer<typeof manualReservationSchema>;
export type ManualReservationFormValues = z.input<typeof manualReservationSchema>;

export const closureSettingsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  opens_at: z.string().regex(/^\d{2}:\d{2}$/),
  closes_at: z.string().regex(/^\d{2}:\d{2}$/),
});
export type BlockedServiceInput = z.infer<typeof closureSettingsSchema>;
