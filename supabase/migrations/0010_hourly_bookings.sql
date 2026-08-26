-- Soporte para reservas "por horas" además de "por noche".
--
-- Decisión de diseño: en vez de modelar esto como un sistema paralelo,
-- se extiende el mismo esquema con:
--   - room_types.allows_hourly / hourly_price: qué tipos admiten
--     reserva por horas y a qué precio.
--   - reservations.booking_mode ('nightly' | 'hourly').
--   - reservations.check_in_at / check_out_at: instante preciso,
--     usado solo cuando booking_mode = 'hourly'.
--
-- check_in_date / check_out_date se mantienen para AMBOS modos (para
-- una reserva por horas se derivan del instante preciso, ver
-- create_reservation_atomic). Esto es intencional: todo el código ya
-- existente que filtra/muestra por fecha (dashboard, calendario,
-- listado admin) sigue funcionando sin cambios, porque una reserva por
-- horas también "aparece" en su día correspondiente.
--
-- La función reservation_occupancy() unifica ambos modos en un único
-- rango de tiempo (tstzrange), que es lo que realmente se usa para
-- decidir si dos reservas chocan. Esto reemplaza la comparación de
-- fechas en bruto que usaban search_available_rooms,
-- create_reservation_atomic y confirm_reservation, y es lo que permite
-- que dos reservas por horas en el mismo día pero en horarios distintos
-- NO se consideren en conflicto (algo que la comparación por fecha,
-- por sí sola, no podía distinguir).
--
-- No se agrega buffer de limpieza entre reservas por horas en esta
-- versión (se puede sumar más adelante dentro de
-- reservation_occupancy(), sumando un intervalo al check_out cuando
-- booking_mode = 'hourly', sin tocar nada más).

-- ─────────────────────────────────────────────────────────────
-- room_types: qué tipos admiten reserva por horas y a qué precio
-- ─────────────────────────────────────────────────────────────
alter table public.room_types
  add column if not exists allows_hourly boolean not null default false,
  add column if not exists hourly_price numeric(10, 2);

alter table public.room_types
  add constraint room_types_hourly_price_check
  check (allows_hourly = false or (hourly_price is not null and hourly_price > 0));

-- ─────────────────────────────────────────────────────────────
-- reservations: modo de reserva + instante preciso para "por horas"
-- ─────────────────────────────────────────────────────────────
alter table public.reservations
  add column if not exists booking_mode text not null default 'nightly' check (booking_mode in ('nightly', 'hourly')),
  add column if not exists check_in_at timestamptz,
  add column if not exists check_out_at timestamptz;

alter table public.reservations
  add constraint reservations_hourly_times_check
  check (
    (booking_mode = 'hourly' and check_in_at is not null and check_out_at is not null and check_out_at > check_in_at)
    or
    (booking_mode = 'nightly' and check_in_at is null and check_out_at is null)
  );

-- ─────────────────────────────────────────────────────────────
-- Rango de ocupación unificado. IMMUTABLE: depende solo de sus
-- argumentos, lo que permite usarla dentro del EXCLUDE USING gist.
-- ─────────────────────────────────────────────────────────────
create or replace function public.reservation_occupancy(
  p_booking_mode text,
  p_check_in_date date,
  p_check_out_date date,
  p_check_in_at timestamptz,
  p_check_out_at timestamptz
)
returns tstzrange
language sql
immutable
as $$
  select case
    when p_booking_mode = 'hourly' then tstzrange(p_check_in_at, p_check_out_at, '[)')
    else tstzrange(p_check_in_date::timestamp at time zone 'utc', p_check_out_date::timestamp at time zone 'utc', '[)')
  end;
$$;

-- Reemplaza el constraint de exclusión para que use el rango unificado
-- en vez de comparar directamente check_in_date/check_out_date.
alter table public.reservations drop constraint if exists reservations_no_overlap;

alter table public.reservations
  add constraint reservations_no_overlap
  exclude using gist (
    room_id with =,
    reservation_occupancy(booking_mode, check_in_date, check_out_date, check_in_at, check_out_at) with &&
  )
  where (status in ('confirmed', 'checked_in'));

-- ─────────────────────────────────────────────────────────────
-- search_available_rooms (nocturna): misma firma, ahora comparando
-- por rango de ocupación unificado en vez de solo por fecha. Esto
-- corrige un caso que antes no se contemplaba: una habitación con una
-- reserva por horas ese mismo día también debe excluirse de la
-- búsqueda nocturna.
-- ─────────────────────────────────────────────────────────────
create or replace function public.search_available_rooms(
  p_check_in date,
  p_check_out date,
  p_guests integer
)
returns table (
  room_type_id uuid,
  name text,
  slug text,
  short_description text,
  capacity integer,
  base_price numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct rt.id, rt.name, rt.slug, rt.short_description, rt.capacity, rt.base_price
  from room_types rt
  join rooms r on r.room_type_id = rt.id
  where rt.active = true
    and r.status = 'available'
    and rt.capacity >= p_guests
    and p_check_out > p_check_in
    and not exists (
      select 1 from reservations res
      where res.room_id = r.id
        and res.status in ('confirmed', 'checked_in')
        and public.reservation_occupancy(res.booking_mode, res.check_in_date, res.check_out_date, res.check_in_at, res.check_out_at)
            && tstzrange(p_check_in::timestamp at time zone 'utc', p_check_out::timestamp at time zone 'utc', '[)')
    )
  order by rt.base_price asc;
$$;

-- ─────────────────────────────────────────────────────────────
-- search_available_rooms_hourly: equivalente para "por horas". Función
-- separada (no una sobrecarga del mismo nombre) para que la llamada
-- RPC desde el cliente sea inequívoca.
-- ─────────────────────────────────────────────────────────────
create or replace function public.search_available_rooms_hourly(
  p_check_in timestamptz,
  p_check_out timestamptz,
  p_guests integer
)
returns table (
  room_type_id uuid,
  name text,
  slug text,
  short_description text,
  capacity integer,
  hourly_price numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct rt.id, rt.name, rt.slug, rt.short_description, rt.capacity, rt.hourly_price
  from room_types rt
  join rooms r on r.room_type_id = rt.id
  where rt.active = true
    and rt.allows_hourly = true
    and r.status = 'available'
    and rt.capacity >= p_guests
    and p_check_out > p_check_in
    and not exists (
      select 1 from reservations res
      where res.room_id = r.id
        and res.status in ('confirmed', 'checked_in')
        and public.reservation_occupancy(res.booking_mode, res.check_in_date, res.check_out_date, res.check_in_at, res.check_out_at)
            && tstzrange(p_check_in, p_check_out, '[)')
    )
  order by rt.hourly_price asc;
$$;

grant execute on function public.search_available_rooms_hourly(timestamptz, timestamptz, integer) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- create_reservation_atomic: cambia de firma (agrega booking_mode y
-- los parámetros de instante preciso), así que se elimina la versión
-- anterior explícitamente antes de crear la nueva.
-- ─────────────────────────────────────────────────────────────
drop function if exists public.create_reservation_atomic(uuid, date, date, integer, text, text, text, text, text);

create function public.create_reservation_atomic(
  p_room_type_id uuid,
  p_booking_mode text,
  p_check_in date,          -- nightly: fecha de llegada. hourly: ignorado (null).
  p_check_out date,         -- nightly: fecha de salida. hourly: ignorado (null).
  p_check_in_at timestamptz,  -- hourly: instante de inicio. nightly: ignorado (null).
  p_check_out_at timestamptz, -- hourly: instante de fin. nightly: ignorado (null).
  p_guest_count integer,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_guest_document text,
  p_notes text
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
  check_out_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_active boolean;
  v_allows_hourly boolean;
  v_room_id uuid;
  v_code text;
  v_reservation_id uuid;
  v_check_in_date date;
  v_check_out_date date;
  v_requested_range tstzrange;
begin
  if p_booking_mode not in ('nightly', 'hourly') then
    raise exception 'INVALID_BOOKING_MODE';
  end if;

  if p_guest_count is null or p_guest_count < 1 then
    raise exception 'INVALID_GUEST_COUNT';
  end if;

  select capacity, active, allows_hourly into v_capacity, v_active, v_allows_hourly
  from room_types
  where room_types.id = p_room_type_id;

  if not found or v_active is not true then
    raise exception 'ROOM_TYPE_NOT_FOUND';
  end if;

  if p_guest_count > v_capacity then
    raise exception 'CAPACITY_EXCEEDED';
  end if;

  if p_booking_mode = 'nightly' then
    if p_check_in is null or p_check_out is null or p_check_out <= p_check_in or p_check_in < current_date then
      raise exception 'INVALID_DATES';
    end if;
    v_check_in_date := p_check_in;
    v_check_out_date := p_check_out;
  else
    if not v_allows_hourly then
      raise exception 'HOURLY_NOT_ALLOWED';
    end if;
    if p_check_in_at is null or p_check_out_at is null or p_check_out_at <= p_check_in_at or p_check_in_at < now() then
      raise exception 'INVALID_DATES';
    end if;
    -- Deriva el rango de días que ocupa, para que dashboard/calendario/
    -- listado admin (que filtran por check_in_date/check_out_date)
    -- sigan mostrando esta reserva correctamente sin cambios.
    v_check_in_date := p_check_in_at::date;
    v_check_out_date := p_check_out_at::date + 1;
  end if;

  v_requested_range := public.reservation_occupancy(p_booking_mode, v_check_in_date, v_check_out_date, p_check_in_at, p_check_out_at);

  select r.id into v_room_id
  from rooms r
  where r.room_type_id = p_room_type_id
    and r.status = 'available'
    and not exists (
      select 1 from reservations res
      where res.room_id = r.id
        and res.status in ('confirmed', 'checked_in')
        and public.reservation_occupancy(res.booking_mode, res.check_in_date, res.check_out_date, res.check_in_at, res.check_out_at)
            && v_requested_range
    )
  order by r.room_number
  for update skip locked
  limit 1;

  if v_room_id is null then
    raise exception 'NO_AVAILABILITY';
  end if;

  v_code := public.generate_reservation_code();

  begin
    insert into reservations (
      reservation_code, room_id, booking_mode, guest_name, guest_email, guest_phone,
      guest_document, guest_count, check_in_date, check_out_date, check_in_at, check_out_at, notes, status
    ) values (
      v_code, v_room_id, p_booking_mode, p_guest_name, p_guest_email, p_guest_phone,
      p_guest_document, p_guest_count, v_check_in_date, v_check_out_date,
      case when p_booking_mode = 'hourly' then p_check_in_at end,
      case when p_booking_mode = 'hourly' then p_check_out_at end,
      p_notes, 'pending'
    )
    returning reservations.id into v_reservation_id;
  exception
    when exclusion_violation then
      raise exception 'NO_AVAILABILITY';
  end;

  return query
    select r.id, r.reservation_code, r.guest_name, r.status, r.booking_mode,
           r.check_in_date, r.check_out_date, r.check_in_at, r.check_out_at
    from reservations r
    where r.id = v_reservation_id;
end;
$$;

revoke execute on function public.create_reservation_atomic(
  uuid, text, date, date, timestamptz, timestamptz, integer, text, text, text, text, text
) from public;
grant execute on function public.create_reservation_atomic(
  uuid, text, date, date, timestamptz, timestamptz, integer, text, text, text, text, text
) to service_role;

-- ─────────────────────────────────────────────────────────────
-- confirm_reservation: la comprobación de conflicto pasa a usar el
-- rango de ocupación unificado (antes comparaba check_in_date /
-- check_out_date directamente, lo que habría bloqueado incorrectamente
-- dos reservas por horas del mismo día en horarios distintos).
-- ─────────────────────────────────────────────────────────────
create or replace function public.confirm_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation reservations%rowtype;
  v_conflict_exists boolean;
begin
  if not public.is_staff_or_admin(auth.uid()) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_reservation from reservations where id = p_reservation_id for update;
  if not found then
    raise exception 'RESERVATION_NOT_FOUND';
  end if;

  if v_reservation.status <> 'pending' then
    raise exception 'INVALID_TRANSITION';
  end if;

  perform 1 from rooms where rooms.id = v_reservation.room_id for update;

  select exists (
    select 1 from reservations res
    where res.room_id = v_reservation.room_id
      and res.id <> v_reservation.id
      and res.status in ('confirmed', 'checked_in')
      and public.reservation_occupancy(res.booking_mode, res.check_in_date, res.check_out_date, res.check_in_at, res.check_out_at)
          && public.reservation_occupancy(v_reservation.booking_mode, v_reservation.check_in_date, v_reservation.check_out_date, v_reservation.check_in_at, v_reservation.check_out_at)
  ) into v_conflict_exists;

  if v_conflict_exists then
    raise exception 'ROOM_NOT_AVAILABLE';
  end if;

  begin
    update reservations
    set status = 'confirmed', confirmed_at = now()
    where id = p_reservation_id
    returning * into v_reservation;
  exception
    when exclusion_violation then
      raise exception 'ROOM_NOT_AVAILABLE';
  end;

  return v_reservation;
end;
$$;
