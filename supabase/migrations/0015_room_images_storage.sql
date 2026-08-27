-- Bucket de Supabase Storage para imágenes de habitaciones subidas
-- desde /admin/room-types. Público en lectura (para que <img src>
-- funcione sin autenticación, igual que las imágenes locales de
-- public/images/), solo staff/admin puede subir/reemplazar/borrar —
-- mismo patrón is_staff_or_admin() que ya usan las tablas.
insert into storage.buckets (id, name, public)
values ('room-images', 'room-images', true)
on conflict (id) do nothing;

create policy "room_images_bucket_select_public"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'room-images');

create policy "room_images_bucket_write_staff"
on storage.objects for all
to authenticated
using (bucket_id = 'room-images' and public.is_staff_or_admin(auth.uid()))
with check (bucket_id = 'room-images' and public.is_staff_or_admin(auth.uid()));
