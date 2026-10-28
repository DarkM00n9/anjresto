-- Phase 3 : anti-spam. Table jamais exposée publiquement (RLS activée, aucune
-- policy) : uniquement accessible via la clé service_role, côté serveur.

create table reservation_rate_limits (
  id bigint generated always as identity primary key,
  ip text not null,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index reservation_rate_limits_ip_idx on reservation_rate_limits (ip, created_at);

alter table reservation_rate_limits enable row level security;
