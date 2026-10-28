-- Phase 3 : réglages du système de réservation, un par restaurant

create table reservation_settings (
  restaurant_id uuid primary key references restaurants(id) on delete cascade,
  slot_interval_minutes smallint not null default 30 check (slot_interval_minutes in (15, 30)),
  max_covers_per_slot smallint not null default 20 check (max_covers_per_slot > 0),
  max_party_size_online smallint not null default 8 check (max_party_size_online > 0),
  min_advance_hours smallint not null default 2 check (min_advance_hours >= 0),
  max_advance_days smallint not null default 30 check (max_advance_days > 0),
  auto_confirm boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger reservation_settings_set_updated_at before update on reservation_settings
  for each row execute function set_updated_at();

alter table reservation_settings enable row level security;

create policy reservation_settings_public_select on reservation_settings
  for select using (
    exists (select 1 from restaurants r where r.id = reservation_settings.restaurant_id and r.is_published = true)
  );

create policy reservation_settings_owner_all on reservation_settings
  for all using (restaurant_id = auth_restaurant_id());

create policy reservation_settings_superadmin_all on reservation_settings
  for all using (is_superadmin());
