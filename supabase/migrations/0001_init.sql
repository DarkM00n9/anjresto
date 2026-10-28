-- Phase 1 : schéma de base (multi-tenant restaurants)

create extension if not exists "pgcrypto";

-- ============ ENUMS ============
create type app_role as enum ('superadmin', 'owner');

create type allergen as enum (
  'gluten', 'crustaces', 'oeufs', 'poissons', 'arachides',
  'soja', 'lait', 'fruits_a_coque', 'celeri', 'moutarde',
  'sesame', 'sulfites', 'lupin', 'mollusques'
);

create type layout_style as enum ('bistrot_chaleureux', 'moderne_epure', 'mediterraneen');

create type reservation_status as enum ('pending', 'confirmed', 'cancelled', 'no_show');

-- ============ RESTAURANTS ============
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  custom_domain text unique,
  is_published boolean not null default false,

  -- Identité
  name text not null,
  tagline text,
  description text,
  cuisine_type text,

  -- Médias
  logo_url text,
  cover_image_url text,
  gallery_urls text[] not null default '{}', -- photos de la section "À propos"

  -- Contact
  phone text,
  email text,
  address_line text,
  postal_code text,
  city text default 'Marseille',
  latitude double precision,
  longitude double precision,
  instagram_url text,
  facebook_url text,

  -- Légal (mentions légales générées dynamiquement)
  legal_name text,
  siret text,
  legal_representative text,

  -- Thème (JSONB pour rester flexible sans migration à chaque ajout de style)
  theme jsonb not null default '{
    "primary_color": "#C8553D",
    "secondary_color": "#2E4057",
    "font_title": "Playfair Display",
    "layout_style": "bistrot_chaleureux"
  }'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index restaurants_slug_idx on restaurants (slug);
create index restaurants_custom_domain_idx on restaurants (custom_domain);

-- ============ PROFILES (lien auth.users -> resto) ============
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'owner',
  restaurant_id uuid references restaurants(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- ============ CATÉGORIES ============
create table categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  description text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index categories_restaurant_idx on categories (restaurant_id);

-- ============ PLATS ============
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,

  name text not null,
  description text,
  price numeric(6,2) not null check (price >= 0),
  photo_url text,

  is_available boolean not null default true,
  is_daily_special boolean not null default false,

  is_vegetarian boolean not null default false,
  is_vegan boolean not null default false,
  is_gluten_free boolean not null default false,
  is_spicy boolean not null default false,
  is_homemade boolean not null default false,

  allergens allergen[] not null default '{}',

  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menu_items_restaurant_idx on menu_items (restaurant_id);
create index menu_items_category_idx on menu_items (category_id);

-- ============ HORAIRES ============
-- Plusieurs lignes possibles par jour (service midi / soir)
create table opening_hours (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = dimanche
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  created_at timestamptz not null default now()
);

create index opening_hours_restaurant_idx on opening_hours (restaurant_id);

-- ============ RÉSERVATIONS (schéma prêt, UI en phase ultérieure) ============
create table reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  party_size int not null check (party_size > 0),
  reservation_date date not null,
  reservation_time time not null,
  status reservation_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create index reservations_restaurant_idx on reservations (restaurant_id, reservation_date);

-- ============ updated_at automatique ============
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger restaurants_set_updated_at before update on restaurants
  for each row execute function set_updated_at();
create trigger menu_items_set_updated_at before update on menu_items
  for each row execute function set_updated_at();
