-- Signature électronique des devis (sur place ou par lien) et suivi de l'envoi.

alter table quotes add column if not exists public_token text unique
  default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''));
alter table quotes add column if not exists sent_at timestamptz;
alter table quotes add column if not exists signature_data text;
alter table quotes add column if not exists signed_name text;
alter table quotes add column if not exists signed_at timestamptz;
alter table quotes add column if not exists signed_method text check (signed_method in ('in_person', 'remote'));
alter table quotes add column if not exists signed_ip text;
alter table quotes add column if not exists signed_user_agent text;
