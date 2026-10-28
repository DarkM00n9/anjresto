-- Phase 1 : Row Level Security

alter table restaurants enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table opening_hours enable row level security;
alter table reservations enable row level security;

-- Resto de l'utilisateur connecté
create or replace function auth_restaurant_id() returns uuid as $$
  select restaurant_id from profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

create or replace function is_superadmin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'superadmin');
$$ language sql stable security definer set search_path = public;

-- RESTAURANTS
create policy restaurants_public_select on restaurants
  for select using (is_published = true);

create policy restaurants_owner_select on restaurants
  for select using (id = auth_restaurant_id());

create policy restaurants_owner_update on restaurants
  for update using (id = auth_restaurant_id());

create policy restaurants_superadmin_all on restaurants
  for all using (is_superadmin());

-- PROFILES
create policy profiles_self_select on profiles
  for select using (id = auth.uid());

create policy profiles_superadmin_all on profiles
  for all using (is_superadmin());

-- CATEGORIES
create policy categories_public_select on categories
  for select using (
    exists (select 1 from restaurants r where r.id = categories.restaurant_id and r.is_published = true)
  );

create policy categories_owner_all on categories
  for all using (restaurant_id = auth_restaurant_id());

create policy categories_superadmin_all on categories
  for all using (is_superadmin());

-- MENU_ITEMS
create policy menu_items_public_select on menu_items
  for select using (
    exists (select 1 from restaurants r where r.id = menu_items.restaurant_id and r.is_published = true)
  );

create policy menu_items_owner_all on menu_items
  for all using (restaurant_id = auth_restaurant_id());

create policy menu_items_superadmin_all on menu_items
  for all using (is_superadmin());

-- OPENING_HOURS
create policy opening_hours_public_select on opening_hours
  for select using (
    exists (select 1 from restaurants r where r.id = opening_hours.restaurant_id and r.is_published = true)
  );

create policy opening_hours_owner_all on opening_hours
  for all using (restaurant_id = auth_restaurant_id());

create policy opening_hours_superadmin_all on opening_hours
  for all using (is_superadmin());

-- RESERVATIONS : le public peut seulement créer une demande, le resto gère les siennes
create policy reservations_public_insert on reservations
  for insert with check (
    exists (select 1 from restaurants r where r.id = reservations.restaurant_id and r.is_published = true)
  );

create policy reservations_owner_select on reservations
  for select using (restaurant_id = auth_restaurant_id());

create policy reservations_owner_update on reservations
  for update using (restaurant_id = auth_restaurant_id());

create policy reservations_superadmin_all on reservations
  for all using (is_superadmin());
