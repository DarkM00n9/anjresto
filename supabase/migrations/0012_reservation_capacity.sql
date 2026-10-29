-- Réglages de réservation plus clairs : capacité totale du restaurant (places assises),
-- durée moyenne d'un repas, et délai avant la fermeture pour la dernière réservation.

alter table reservation_settings
  add column total_seats smallint not null default 40 check (total_seats > 0),
  add column meal_duration_minutes smallint not null default 90 check (meal_duration_minutes between 30 and 360),
  add column last_booking_before_close_minutes smallint not null default 30 check (last_booking_before_close_minutes between 0 and 240);
