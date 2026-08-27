-- Datos de demostración para desarrollo local. Seguro de ejecutar
-- varias veces (usa ON CONFLICT DO NOTHING donde aplica).
--
-- Cómo ejecutarlo: ver supabase/README.md.
--
-- room_types.id es un entero autoincremental (ver
-- 0016_sequential_room_ids.sql), así que nunca se conoce de antemano:
-- rooms/room_images se insertan referenciando el tipo por su slug
-- (único), no por un id fijo.

-- ─────────────────────────────────────────────────────────────
-- Tipos de habitación
-- ─────────────────────────────────────────────────────────────
insert into public.room_types (name, slug, short_description, description, capacity, base_price, active)
values
  ('Matrimonial', 'matrimonial',
   'Cama matrimonial, ideal para parejas.',
   'Habitación cómoda con cama matrimonial, baño privado con agua caliente, TV por cable y WiFi de alta velocidad. Perfecta para estadías de descanso.',
   2, 120.00, true),
  ('Doble', 'doble',
   'Dos camas individuales, ideal para amigos o colegas.',
   'Habitación amplia con dos camas individuales, baño privado, TV por cable y WiFi. Pensada para viajeros que comparten habitación.',
   2, 100.00, true),
  ('Familiar', 'familiar',
   'Espacio amplio para toda la familia.',
   'Habitación familiar con capacidad para hasta 4 huéspedes, cama matrimonial y camas individuales adicionales, baño privado, TV y WiFi.',
   4, 180.00, true)
on conflict (slug) do nothing;

-- Matrimonial y Doble se ofrecen "solo por horas" (paquete fijo:
-- precio + cantidad de horas, no una tarifa por hora ni una opción
-- adicional a la nocturna — ambas modalidades son excluyentes, ver
-- 0018_exclusive_room_booking_type.sql, por eso base_price pasa a
-- null); Familiar se deja solo para estadías por noche (caso típico:
-- habitaciones grandes/familiares no suelen ofrecerse por horas).
update public.room_types
set allows_hourly = true, base_price = null, hourly_price = 60.00, hourly_duration_hours = 3
where slug = 'matrimonial';
update public.room_types
set allows_hourly = true, base_price = null, hourly_price = 40.00, hourly_duration_hours = 2
where slug = 'doble';

-- ─────────────────────────────────────────────────────────────
-- Habitaciones físicas
-- ─────────────────────────────────────────────────────────────
insert into public.rooms (room_number, room_type_id, floor, status)
select v.room_number, rt.id, v.floor, v.status
from (
  values
    ('101', 'matrimonial', '1', 'available'),
    ('102', 'matrimonial', '1', 'available'),
    ('103', 'matrimonial', '1', 'disabled'),
    ('201', 'doble', '2', 'available'),
    ('202', 'doble', '2', 'available'),
    ('301', 'familiar', '3', 'available')
) as v(room_number, slug, floor, status)
join public.room_types rt on rt.slug = v.slug
on conflict (room_number) do nothing;

-- ─────────────────────────────────────────────────────────────
-- Imágenes de ejemplo (placeholders locales, no dependen de servicios
-- externos). Reemplázalas subiendo tus propias fotos a
-- public/images/rooms/ y actualizando estas filas.
-- ─────────────────────────────────────────────────────────────
insert into public.room_images (room_type_id, image_url, alt_text, display_order)
select rt.id, v.image_url, v.alt_text, v.display_order
from (
  values
    ('matrimonial', '/images/rooms/matrimonial-1.svg', 'Habitación Matrimonial', 0),
    ('matrimonial', '/images/rooms/matrimonial-2.svg', 'Habitación Matrimonial, vista 2', 1),
    ('doble', '/images/rooms/doble-1.svg', 'Habitación Doble', 0),
    ('doble', '/images/rooms/doble-2.svg', 'Habitación Doble, vista 2', 1),
    ('familiar', '/images/rooms/familiar-1.svg', 'Habitación Familiar', 0),
    ('familiar', '/images/rooms/familiar-2.svg', 'Habitación Familiar, vista 2', 1)
) as v(slug, image_url, alt_text, display_order)
join public.room_types rt on rt.slug = v.slug
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
