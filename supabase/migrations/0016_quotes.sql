-- Devis du superadmin : infos de la société émettrice (une seule ligne) et devis.

create table if not exists company_settings (
  id int primary key default 1 check (id = 1),
  legal_name text not null default 'NJ INVEST',
  legal_form text not null default 'SASU',
  share_capital text,
  representative text,
  address_line text,
  postal_code text,
  city text not null default 'Marseille',
  siret text,
  rcs text,
  vat_number text,
  vat_rate numeric(4,2) not null default 20,
  email text,
  phone text,
  iban text,
  bic text,
  updated_at timestamptz not null default now()
);
-- Données publiques (annuaire des entreprises) ; à compléter : capital, email, téléphone, IBAN.
insert into company_settings (id, legal_name, legal_form, representative, address_line, postal_code, city, siret, rcs, vat_number)
values (1, 'NJ INVEST', 'SASU', 'Noam Jaoui', '6 rue Barthet', '13010', 'Marseille', '99486022900016', 'Marseille 994 860 229', 'FR18994860229')
on conflict (id) do nothing;

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  quote_date date not null default current_date,
  valid_until date,
  restaurant_id uuid references restaurants(id) on delete set null,
  client_name text not null,
  client_representative text,
  client_address text,
  client_email text,
  client_phone text,
  lines jsonb not null default '[]'::jsonb,
  deposit_percent numeric(5,2) not null default 40,
  monthly_price numeric(8,2) not null default 0,
  monthly_description text,
  delivery_days int not null default 5,
  notes text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'signed', 'refused')),
  created_at timestamptz not null default now()
);

alter table company_settings enable row level security;
alter table quotes enable row level security;

create policy company_settings_superadmin_all on company_settings for all using (is_superadmin());
create policy quotes_superadmin_all on quotes for all using (is_superadmin());
