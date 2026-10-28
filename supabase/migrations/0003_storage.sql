-- Phase 1 : bucket de stockage pour les médias (logos, covers, photos de plats)
-- Convention de chemin : {restaurant_id}/{fichier}

insert into storage.buckets (id, name, public)
values ('restaurant-media', 'restaurant-media', true)
on conflict (id) do nothing;

create policy restaurant_media_public_read on storage.objects
  for select using (bucket_id = 'restaurant-media');

create policy restaurant_media_owner_insert on storage.objects
  for insert with check (
    bucket_id = 'restaurant-media'
    and auth_restaurant_id() is not null
    and (storage.foldername(name))[1] = auth_restaurant_id()::text
  );

create policy restaurant_media_owner_update on storage.objects
  for update using (
    bucket_id = 'restaurant-media'
    and (storage.foldername(name))[1] = auth_restaurant_id()::text
  );

create policy restaurant_media_owner_delete on storage.objects
  for delete using (
    bucket_id = 'restaurant-media'
    and (storage.foldername(name))[1] = auth_restaurant_id()::text
  );

create policy restaurant_media_superadmin_all on storage.objects
  for all using (bucket_id = 'restaurant-media' and is_superadmin());
