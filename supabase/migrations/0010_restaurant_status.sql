-- Phase 4 : remplace le booléen is_published par un statut à 3 valeurs
-- (démo / actif / suspendu), piloté depuis /superadmin.

create type restaurant_status as enum ('demo', 'active', 'suspended');

alter table restaurants add column status restaurant_status not null default 'demo';
update restaurants
  set status = (case when is_published then 'active' else 'demo' end)::restaurant_status;

-- Les anciennes policies référencent is_published : il faut les remplacer AVANT de
-- pouvoir supprimer la colonne.

-- La ligne resto elle-même reste toujours lisible publiquement : il faut connaître
-- son statut pour savoir quelle page afficher (site normal / bandeau démo / page
-- "indisponible"). Le CONTENU (carte, horaires, réservations...) reste lui filtré
-- par statut (démo et actif sont traités pareil, suspendu masque tout).
drop policy restaurants_public_select on restaurants;
create policy restaurants_public_select on restaurants
  for select using (true);

drop policy categories_public_select on categories;
create policy categories_public_select on categories
  for select using (
    exists (select 1 from restaurants r where r.id = categories.restaurant_id and r.status in ('demo', 'active'))
  );

drop policy menu_items_public_select on menu_items;
create policy menu_items_public_select on menu_items
  for select using (
    exists (select 1 from restaurants r where r.id = menu_items.restaurant_id and r.status in ('demo', 'active'))
  );

drop policy opening_hours_public_select on opening_hours;
create policy opening_hours_public_select on opening_hours
  for select using (
    exists (select 1 from restaurants r where r.id = opening_hours.restaurant_id and r.status in ('demo', 'active'))
  );

drop policy reservations_public_insert on reservations;
create policy reservations_public_insert on reservations
  for insert with check (
    exists (select 1 from restaurants r where r.id = reservations.restaurant_id and r.status in ('demo', 'active'))
  );

drop policy closures_public_select on closures;
create policy closures_public_select on closures
  for select using (
    exists (select 1 from restaurants r where r.id = closures.restaurant_id and r.status in ('demo', 'active'))
  );

drop policy daily_menus_public_select on daily_menus;
create policy daily_menus_public_select on daily_menus
  for select using (
    exists (select 1 from restaurants r where r.id = daily_menus.restaurant_id and r.status in ('demo', 'active'))
  );

drop policy reservation_settings_public_select on reservation_settings;
create policy reservation_settings_public_select on reservation_settings
  for select using (
    exists (select 1 from restaurants r where r.id = reservation_settings.restaurant_id and r.status in ('demo', 'active'))
  );

drop policy blocked_services_public_select on blocked_services;
create policy blocked_services_public_select on blocked_services
  for select using (
    exists (select 1 from restaurants r where r.id = blocked_services.restaurant_id and r.status in ('demo', 'active'))
  );

alter table restaurants drop column is_published;
