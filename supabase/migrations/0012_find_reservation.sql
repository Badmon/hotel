-- Búsqueda pública de una reserva por código + correo. Deliberadamente
-- exige AMBOS datos (no solo el código): el código por sí solo es
-- adivinable por fuerza bruta con suficientes intentos, pero exigir
-- también el correo exacto usado al reservar hace la combinación
-- prácticamente imposible de adivinar, sin necesitar cuenta de
-- usuario. Mismo patrón que "número de confirmación + apellido/correo"
-- que usan aerolíneas y hoteles.
--
-- SECURITY DEFINER porque anon no tiene (ni debe tener) SELECT directo
-- sobre reservations; esta función es la única puerta de entrada
-- pública de solo lectura hacia esa tabla, y solo devuelve columnas
-- seguras (nada de guest_phone, guest_document ni internal_notes).

create or replace function public.find_reservation_by_code(
  p_reservation_code text,
  p_guest_email text
)
returns table (
  id uuid,
  reservation_code text,
  guest_name text,
  status text,
  booking_mode text,
  check_in_date date,
  check_out_date date,
  check_in_at timestamptz,
  check_out_at timestamptz,
  room_type_name text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.reservation_code, r.guest_name, r.status, r.booking_mode,
         r.check_in_date, r.check_out_date, r.check_in_at, r.check_out_at,
         rt.name, r.created_at
  from reservations r
  join rooms rm on rm.id = r.room_id
  join room_types rt on rt.id = rm.room_type_id
  where upper(trim(r.reservation_code)) = upper(trim(p_reservation_code))
    and lower(trim(r.guest_email)) = lower(trim(p_guest_email))
  limit 1;
$$;

grant execute on function public.find_reservation_by_code(text, text) to anon, authenticated;
