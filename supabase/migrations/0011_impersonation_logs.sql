-- Phase 4 : journal des connexions "en tant que" depuis /superadmin

create table impersonation_logs (
  id uuid primary key default gen_random_uuid(),
  superadmin_id uuid not null references auth.users(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index impersonation_logs_restaurant_idx on impersonation_logs (restaurant_id, created_at);

alter table impersonation_logs enable row level security;

create policy impersonation_logs_superadmin_all on impersonation_logs
  for all using (is_superadmin());
