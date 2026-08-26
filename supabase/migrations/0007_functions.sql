-- Funciones de disponibilidad y de negocio. Centralizar esta lógica en
-- Postgres (en vez de repetirla en el frontend y en la Netlify
-- Function) es lo que permite que la comprobación de disponibilidad
-- sea atómica y resistente a condiciones de carrera.

-- ─────────────────────────────────────────────────────────────
-- Código de reserva legible y difícil de adivinar: HT-2026-A8F32
-- ─────────────────────────────────────────────────────────────
create or replace function public.generate_reservation_code()
returns text
language plpgsql
volatile
as $$
declare
  charset text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- sin 0/O/1/I para evitar confusiones
  suffix text := '';
  i integer;
begin
  for i in 1..5 loop
    suffix := suffix || substr(charset, 1 + floor(random() * length(charset))::integer, 1);
  end loop;

  return 'HT-' || extract(year from now())::text || '-' || suffix;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Búsqueda pública de disponibilidad: un tipo de habitación aparece si
-- al menos una habitación física de ese tipo está disponible.
-- SECURITY DEFINER para poder consultar reservations (que no tiene
-- policy de SELECT para anon) sin exponer sus filas: solo se
-- devuelven columnas públicas de room_types.
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
        and res.check_in_date < p_check_out
        and res.check_out_date > p_check_in
    )
  order by rt.base_price asc;
$$;

grant execute on function public.search_available_rooms(date, date, integer) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Creación atómica de una reserva pública. Solo puede ejecutarla la
-- service role (ver GRANT al final): el único punto de entrada real
-- es la Netlify Function create-reservation, que ya validó el input.
--
-- Vuelve a validar todo en el servidor, elige una habitación física
-- disponible con FOR UPDATE SKIP LOCKED (evita bloquear a otros
-- huéspedes reservando otras habitaciones en simultáneo) y, como
-- último respaldo, se apoya en el constraint reservations_no_overlap
-- por si dos transacciones concurrentes intentaran la misma
-- habitación exactamente al mismo tiempo.
-- ─────────────────────────────────────────────────────────────
create or replace function public.create_reservation_atomic(
  p_room_type_id uuid,
  p_check_in date,
  p_check_out date,
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
  check_in_date date,
  check_out_date date
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_active boolean;
  v_room_id uuid;
  v_code text;
  v_reservation_id uuid;
begin
  if p_check_out <= p_check_in or p_check_in < current_date then
    raise exception 'INVALID_DATES';
  end if;

  if p_guest_count is null or p_guest_count < 1 then
    raise exception 'INVALID_GUEST_COUNT';
  end if;

  select capacity, active into v_capacity, v_active
  from room_types
  where room_types.id = p_room_type_id;

  if not found or v_active is not true then
    raise exception 'ROOM_TYPE_NOT_FOUND';
  end if;

  if p_guest_count > v_capacity then
    raise exception 'CAPACITY_EXCEEDED';
  end if;

  select r.id into v_room_id
  from rooms r
  where r.room_type_id = p_room_type_id
    and r.status = 'available'
    and not exists (
      select 1 from reservations res
      where res.room_id = r.id
        and res.status in ('confirmed', 'checked_in')
        and res.check_in_date < p_check_out
        and res.check_out_date > p_check_in
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
      reservation_code, room_id, guest_name, guest_email, guest_phone,
      guest_document, guest_count, check_in_date, check_out_date, notes, status
    ) values (
      v_code, v_room_id, p_guest_name, p_guest_email, p_guest_phone,
      p_guest_document, p_guest_count, p_check_in, p_check_out, p_notes, 'pending'
    )
    returning reservations.id into v_reservation_id;
  exception
    when exclusion_violation then
      raise exception 'NO_AVAILABILITY';
  end;

  return query
    select r.id, r.reservation_code, r.guest_name, r.status, r.check_in_date, r.check_out_date
    from reservations r
    where r.id = v_reservation_id;
end;
$$;

revoke execute on function public.create_reservation_atomic(
  uuid, date, date, integer, text, text, text, text, text
) from public;
grant execute on function public.create_reservation_atomic(
  uuid, date, date, integer, text, text, text, text, text
) to service_role;

-- ─────────────────────────────────────────────────────────────
-- Acciones administrativas de cambio de estado. Cada función:
--  1) exige que el usuario autenticado sea staff/admin;
--  2) valida que la transición sea válida desde el estado actual;
--  3) para confirm_reservation, vuelve a comprobar disponibilidad
--     (protección contra condiciones de carrera al confirmar dos
--     reservas pendientes incompatibles).
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
      and res.check_in_date < v_reservation.check_out_date
      and res.check_out_date > v_reservation.check_in_date
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

create or replace function public.reject_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation reservations%rowtype;
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

  update reservations set status = 'rejected'
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

create or replace function public.cancel_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation reservations%rowtype;
begin
  if not public.is_staff_or_admin(auth.uid()) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_reservation from reservations where id = p_reservation_id for update;
  if not found then
    raise exception 'RESERVATION_NOT_FOUND';
  end if;

  if v_reservation.status not in ('pending', 'confirmed') then
    raise exception 'INVALID_TRANSITION';
  end if;

  update reservations set status = 'cancelled', cancelled_at = now()
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

create or replace function public.checkin_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation reservations%rowtype;
begin
  if not public.is_staff_or_admin(auth.uid()) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_reservation from reservations where id = p_reservation_id for update;
  if not found then
    raise exception 'RESERVATION_NOT_FOUND';
  end if;

  if v_reservation.status <> 'confirmed' then
    raise exception 'INVALID_TRANSITION';
  end if;

  update reservations set status = 'checked_in', checked_in_at = now()
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

create or replace function public.checkout_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation reservations%rowtype;
begin
  if not public.is_staff_or_admin(auth.uid()) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_reservation from reservations where id = p_reservation_id for update;
  if not found then
    raise exception 'RESERVATION_NOT_FOUND';
  end if;

  if v_reservation.status <> 'checked_in' then
    raise exception 'INVALID_TRANSITION';
  end if;

  update reservations set status = 'completed', checked_out_at = now()
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

create or replace function public.no_show_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation reservations%rowtype;
begin
  if not public.is_staff_or_admin(auth.uid()) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_reservation from reservations where id = p_reservation_id for update;
  if not found then
    raise exception 'RESERVATION_NOT_FOUND';
  end if;

  if v_reservation.status <> 'confirmed' then
    raise exception 'INVALID_TRANSITION';
  end if;

  update reservations set status = 'no_show'
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

grant execute on function public.confirm_reservation(uuid) to authenticated;
grant execute on function public.reject_reservation(uuid) to authenticated;
grant execute on function public.cancel_reservation(uuid) to authenticated;
grant execute on function public.checkin_reservation(uuid) to authenticated;
grant execute on function public.checkout_reservation(uuid) to authenticated;
grant execute on function public.no_show_reservation(uuid) to authenticated;
