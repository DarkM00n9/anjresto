-- Avis Google, facturation (suivi des abonnements), liste d'attente, notes clients.

alter table restaurants
  add column google_reviews_url text,
  add column google_rating numeric(2,1) check (google_rating between 0 and 5),
  add column google_reviews_count integer check (google_reviews_count >= 0),
  add column subscription_status text not null default 'trial' check (subscription_status in ('trial', 'paid', 'unpaid')),
  add column paid_until date,
  add column monthly_price numeric(6,2) not null default 39;

update restaurants set subscription_status = 'paid' where status = 'active';

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  wanted_date date not null,
  party_size integer not null check (party_size > 0),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  status text not null default 'waiting' check (status in ('waiting', 'notified', 'done')),
  created_at timestamptz not null default now()
);
create index waitlist_restaurant_idx on waitlist (restaurant_id, wanted_date);
alter table waitlist enable row level security;
create policy waitlist_owner_all on waitlist for all using (restaurant_id = auth_restaurant_id());
create policy waitlist_superadmin_all on waitlist for all using (is_superadmin());

create table customer_notes (
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  phone text not null,
  note text,
  is_vip boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (restaurant_id, phone)
);
alter table customer_notes enable row level security;
create policy customer_notes_owner_all on customer_notes for all using (restaurant_id = auth_restaurant_id());
create policy customer_notes_superadmin_all on customer_notes for all using (is_superadmin());
