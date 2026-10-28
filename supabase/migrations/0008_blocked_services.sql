-- Phase 3 : "fermer un service complet" en un tap, ponctuellement, sans fermer tout le resto

create table blocked_services (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  date date not null,
  opens_at time not null,
  closes_at time not null,
  created_at timestamptz not null default now(),
  unique (restaurant_id, date, opens_at, closes_at)
);

create index blocked_services_restaurant_idx on blocked_services (restaurant_id, date);

alter table blocked_services enable row level security;

create policy blocked_services_public_select on blocked_services
  for select using (
    exists (select 1 from restaurants r where r.id = blocked_services.restaurant_id and r.is_published = true)
  );

create policy blocked_services_owner_all on blocked_services
  for all using (restaurant_id = auth_restaurant_id());

create policy blocked_services_superadmin_all on blocked_services
  for all using (is_superadmin());
