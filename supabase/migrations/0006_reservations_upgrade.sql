-- Phase 3 : extension des réservations (statuts, tokens, source, RGPD)

alter type reservation_status add value 'refused';
alter type reservation_status add value 'seated';
-- (pending, confirmed, cancelled, no_show existaient déjà depuis la Phase 1)

alter table reservations add column cancellation_token text unique not null default encode(gen_random_bytes(16), 'hex');
alter table reservations add column action_token text unique not null default encode(gen_random_bytes(16), 'hex');
alter table reservations add column source text not null default 'online' check (source in ('online', 'phone'));
alter table reservations add column consent boolean not null default false;
alter table reservations add column reminder_sent_at timestamptz;
alter table reservations add column updated_at timestamptz not null default now();

create trigger reservations_set_updated_at before update on reservations
  for each row execute function set_updated_at();
