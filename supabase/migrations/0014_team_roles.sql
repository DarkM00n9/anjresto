-- Rôles d'équipe : gérant (manager) et employé (staff), en plus du propriétaire.
-- Plusieurs profils peuvent déjà être rattachés au même restaurant (profiles.restaurant_id).
alter type app_role add value if not exists 'manager';
alter type app_role add value if not exists 'staff';
