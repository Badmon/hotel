-- Agrega el timestamp que faltaba: cuándo se rechazó una reserva.
-- (confirmed_at, checked_in_at, checked_out_at y cancelled_at ya
-- existían desde 0006; solo faltaba el caso "rejected").

alter table public.reservations add column if not exists rejected_at timestamptz;

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

  update reservations set status = 'rejected', rejected_at = now()
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;
