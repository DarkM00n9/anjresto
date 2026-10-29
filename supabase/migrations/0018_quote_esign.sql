-- Signature électronique avec vérification d'identité par code email et preuve d'intégrité.

alter table quotes add column if not exists vat_rate numeric(4,2);
alter table quotes add column if not exists signed_hash text;
alter table quotes add column if not exists signed_email text;
alter table quotes add column if not exists signed_verified boolean not null default false;

create table if not exists quote_otps (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists quote_otps_quote_idx on quote_otps (quote_id, created_at desc);

alter table quote_otps enable row level security;
create policy quote_otps_superadmin_all on quote_otps for all using (is_superadmin());
