-- Corrige la ambigüedad entre la columna de salida `id` de la función
-- y `room_types.id`, que provocaba el error PostgreSQL 42702 al crear
-- una reserva.

create or replace function public.create_reservation_atomic(
  p_room_type_id integer,
  p_booking_mode text,
  p_check_in date,
  p_check_out date,
  p_check_in_at timestamptz,
  p_guest_count integer,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_guest_document text,
  p_notes text
)
returns table (id uuid, reservation_code text, guest_name text, status text, booking_mode text, check_in_date date, check_out_date date, check_in_at timestamptz, check_out_at timestamptz)
language plpgsql security definer set search_path = public
as $$
declare
  v_capacity integer; v_active boolean; v_allows_hourly boolean; v_duration integer;
  v_check_out_at timestamptz; v_room_id integer; v_code text; v_reservation_id uuid;
  v_check_in_date date; v_check_out_date date; v_requested_range tstzrange;
begin
  if p_booking_mode not in ('nightly', 'hourly') then raise exception 'INVALID_BOOKING_MODE'; end if;
  if p_guest_count is null or p_guest_count < 1 then raise exception 'INVALID_GUEST_COUNT'; end if;

  select rt.capacity, rt.active, rt.allows_hourly, rt.hourly_duration_hours
  into v_capacity, v_active, v_allows_hourly, v_duration
  from room_types rt
  where rt.id = p_room_type_id;

  if not found or v_active is not true then raise exception 'ROOM_TYPE_NOT_FOUND'; end if;
  if p_guest_count > v_capacity then raise exception 'CAPACITY_EXCEEDED'; end if;

  if p_booking_mode = 'nightly' then
    if v_allows_hourly then raise exception 'NIGHTLY_NOT_ALLOWED'; end if;
    if p_check_in is null or p_check_out is null or p_check_out <= p_check_in or p_check_in < current_date - 1 then raise exception 'INVALID_DATES'; end if;
    v_check_in_date := p_check_in; v_check_out_date := p_check_out;
  else
    if not v_allows_hourly then raise exception 'HOURLY_NOT_ALLOWED'; end if;
    if p_check_in_at is null or p_check_in_at < now() then raise exception 'INVALID_DATES'; end if;
    v_check_out_at := p_check_in_at + (v_duration || ' hours')::interval;
    v_check_in_date := p_check_in_at::date; v_check_out_date := v_check_out_at::date + 1;
  end if;

  v_requested_range := public.reservation_occupancy(p_booking_mode, v_check_in_date, v_check_out_date, p_check_in_at, v_check_out_at);
  select r.id into v_room_id from rooms r where r.room_type_id = p_room_type_id and r.status = 'available' and not exists (
    select 1 from reservations res where res.room_id = r.id and res.status in ('confirmed', 'checked_in')
      and public.reservation_occupancy(res.booking_mode, res.check_in_date, res.check_out_date, res.check_in_at, res.check_out_at) && v_requested_range
  ) order by r.room_number for update skip locked limit 1;

  if v_room_id is null then raise exception 'NO_AVAILABILITY'; end if;
  v_code := public.generate_reservation_code();
  begin
    insert into reservations (reservation_code, room_id, booking_mode, guest_name, guest_email, guest_phone, guest_document, guest_count, check_in_date, check_out_date, check_in_at, check_out_at, notes, status)
    values (v_code, v_room_id, p_booking_mode, p_guest_name, p_guest_email, p_guest_phone, p_guest_document, p_guest_count, v_check_in_date, v_check_out_date, case when p_booking_mode = 'hourly' then p_check_in_at end, case when p_booking_mode = 'hourly' then v_check_out_at end, p_notes, 'pending')
    returning reservations.id into v_reservation_id;
  exception when exclusion_violation then raise exception 'NO_AVAILABILITY'; end;

  return query select r.id, r.reservation_code, r.guest_name, r.status, r.booking_mode, r.check_in_date, r.check_out_date, r.check_in_at, r.check_out_at from reservations r where r.id = v_reservation_id;
end;
$$;
