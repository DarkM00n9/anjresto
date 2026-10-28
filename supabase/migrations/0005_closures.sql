-- Phase 2 : fermetures exceptionnelles (vacances, jours fériés...). Surcharge le
-- calcul "ouvert maintenant" du site public et affiche `message` le cas échéant.

create table closures (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  message text,
  created_at timestamptz not null default now()
);

create index closures_restaurant_idx on closures (restaurant_id, start_date, end_date);

alter table closures enable row level security;

create policy closures_public_select on closures
  for select using (
    exists (select 1 from restaurants r where r.id = closures.restaurant_id and r.is_published = true)
  );

create policy closures_owner_all on closures
  for all using (restaurant_id = auth_restaurant_id());

create policy closures_superadmin_all on closures
  for all using (is_superadmin());
