-- Phase 2 : formule "Menu du jour" (distincte du flag is_daily_special sur menu_items,
-- qui sert à la "Suggestion du chef"). Expire automatiquement : n'est affichée que si
-- valid_date = la date du jour (voir lib/get-menu.ts côté public).

create table daily_menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  title text not null default 'Menu du jour',
  starter text,
  main text,
  dessert text,
  price numeric(6,2) not null check (price >= 0),
  valid_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index daily_menus_restaurant_idx on daily_menus (restaurant_id, valid_date);

create trigger daily_menus_set_updated_at before update on daily_menus
  for each row execute function set_updated_at();

alter table daily_menus enable row level security;

create policy daily_menus_public_select on daily_menus
  for select using (
    exists (select 1 from restaurants r where r.id = daily_menus.restaurant_id and r.is_published = true)
  );

create policy daily_menus_owner_all on daily_menus
  for all using (restaurant_id = auth_restaurant_id());

create policy daily_menus_superadmin_all on daily_menus
  for all using (is_superadmin());
