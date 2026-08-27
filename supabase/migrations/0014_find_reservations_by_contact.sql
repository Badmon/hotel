-- Complemento a find_reservation_by_code (0012): permite recuperar
-- reservas cuando el huésped perdió el código mismo, no solo otro
-- dato. Exige correo + teléfono (ambos los sabe el propio huésped, y
-- ninguno es tan trivial de adivinar como para que valga la pena
-- exponerlo solo con uno de los dos) y devuelve como máximo las 10
-- reservas más recientes que coincidan con ambos — nunca por un solo
-- dato, y con tope, para no convertir esto en un buscador general.
--
-- El teléfono se compara solo por dígitos (regexp_replace quita todo
-- lo que no sea número) porque se guarda tal cual lo escribió el
-- huésped al reservar, con formato libre ("+51 999 999 999",
-- "999-999-999", etc.).

create or replace function public.find_reservations_by_contact(
  p_guest_email text,
  p_guest_phone text
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
  where lower(trim(r.guest_email)) = lower(trim(p_guest_email))
    and regexp_replace(r.guest_phone, '\D', '', 'g') = regexp_replace(p_guest_phone, '\D', '', 'g')
    and regexp_replace(p_guest_phone, '\D', '', 'g') <> ''
  order by r.created_at desc
  limit 10;
$$;

grant execute on function public.find_reservations_by_contact(text, text) to anon, authenticated;
