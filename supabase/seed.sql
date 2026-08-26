-- Datos de demostración para desarrollo local. Seguro de ejecutar
-- varias veces (usa ON CONFLICT DO NOTHING donde aplica).
--
-- Cómo ejecutarlo: ver supabase/README.md.

-- ─────────────────────────────────────────────────────────────
-- Tipos de habitación
-- ─────────────────────────────────────────────────────────────
insert into public.room_types (id, name, slug, short_description, description, capacity, base_price, featured, active)
values
  ('11111111-1111-1111-1111-111111111111', 'Matrimonial', 'matrimonial',
   'Cama matrimonial, ideal para parejas.',
   'Habitación cómoda con cama matrimonial, baño privado con agua caliente, TV por cable y WiFi de alta velocidad. Perfecta para estadías de descanso.',
   2, 120.00, true, true),
  ('22222222-2222-2222-2222-222222222222', 'Doble', 'doble',
   'Dos camas individuales, ideal para amigos o colegas.',
   'Habitación amplia con dos camas individuales, baño privado, TV por cable y WiFi. Pensada para viajeros que comparten habitación.',
   2, 100.00, true, true),
  ('33333333-3333-3333-3333-333333333333', 'Familiar', 'familiar',
   'Espacio amplio para toda la familia.',
   'Habitación familiar con capacidad para hasta 4 huéspedes, cama matrimonial y camas individuales adicionales, baño privado, TV y WiFi.',
   4, 180.00, true, true)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────
-- Habitaciones físicas
-- ─────────────────────────────────────────────────────────────
insert into public.rooms (room_number, room_type_id, floor, status)
values
  ('101', '11111111-1111-1111-1111-111111111111', '1', 'available'),
  ('102', '11111111-1111-1111-1111-111111111111', '1', 'available'),
  ('103', '11111111-1111-1111-1111-111111111111', '1', 'maintenance'),
  ('201', '22222222-2222-2222-2222-222222222222', '2', 'available'),
  ('202', '22222222-2222-2222-2222-222222222222', '2', 'available'),
  ('301', '33333333-3333-3333-3333-333333333333', '3', 'available')
on conflict (room_number) do nothing;

-- ─────────────────────────────────────────────────────────────
-- Imágenes de ejemplo (placeholders locales, no dependen de servicios
-- externos). Reemplázalas subiendo tus propias fotos a
-- public/images/rooms/ y actualizando estas filas.
-- ─────────────────────────────────────────────────────────────
insert into public.room_images (room_type_id, image_url, alt_text, display_order)
values
  ('11111111-1111-1111-1111-111111111111', '/images/rooms/matrimonial-1.svg', 'Habitación Matrimonial', 0),
  ('11111111-1111-1111-1111-111111111111', '/images/rooms/matrimonial-2.svg', 'Habitación Matrimonial, vista 2', 1),
  ('22222222-2222-2222-2222-222222222222', '/images/rooms/doble-1.svg', 'Habitación Doble', 0),
  ('22222222-2222-2222-2222-222222222222', '/images/rooms/doble-2.svg', 'Habitación Doble, vista 2', 1),
  ('33333333-3333-3333-3333-333333333333', '/images/rooms/familiar-1.svg', 'Habitación Familiar', 0),
  ('33333333-3333-3333-3333-333333333333', '/images/rooms/familiar-2.svg', 'Habitación Familiar, vista 2', 1)
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Primer usuario administrador
-- ─────────────────────────────────────────────────────────────
-- No se puede crear un usuario de Supabase Auth por SQL de forma
-- confiable (requiere campos internos gestionados por GoTrue). Pasos:
--
--   1. Crea el usuario desde el dashboard de Supabase:
--      Authentication → Users → Add user (o pídele que se registre
--      y confirme su correo).
--   2. Ejecuta lo siguiente reemplazando el correo:
--
-- update public.profiles
-- set role = 'admin'
-- from auth.users
-- where profiles.id = auth.users.id
--   and auth.users.email = 'admin@hoteldemo.com';
