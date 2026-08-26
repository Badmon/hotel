-- reservations: núcleo del sistema de reservas.
--
-- user_id es nullable a propósito: en este MVP se reserva como
-- invitado. Cuando se implemente cuenta de cliente, una reserva podrá
-- asociarse a un user_id sin cambiar el esquema.

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_code text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  room_id uuid not null references public.rooms (id) on delete restrict,
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  guest_document text,
  guest_count integer not null check (guest_count > 0),
  check_in_date date not null,
  check_out_date date not null,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'rejected', 'no_show')
  ),
  notes text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  cancelled_at timestamptz,
  constraint reservations_dates_check check (check_out_date > check_in_date)
);

comment on table public.reservations is 'Nunca se borran: los estados cambian, el historial se conserva completo.';

create extension if not exists pg_trgm;

create index if not exists reservations_room_id_idx on public.reservations (room_id);
create index if not exists reservations_status_idx on public.reservations (status);
create index if not exists reservations_check_in_date_idx on public.reservations (check_in_date);
create index if not exists reservations_check_out_date_idx on public.reservations (check_out_date);
create index if not exists reservations_guest_name_idx on public.reservations using gin (guest_name gin_trgm_ops);

-- Red de seguridad a nivel de base de datos: ninguna habitación puede
-- tener dos reservas "bloqueantes" (confirmed / checked_in) con fechas
-- que se solapen, sin importar qué camino de la aplicación haya
-- intentado insertarlas. Esto es lo que finalmente hace imposible la
-- doble reserva, incluso ante condiciones de carrera.
--
-- daterange(check_in_date, check_out_date, '[)') modela exactamente la
-- regla de solapamiento del proyecto: el check-out no se considera
-- ocupado (rango medio-abierto).

alter table public.reservations
  add constraint reservations_no_overlap
  exclude using gist (
    room_id with =,
    daterange(check_in_date, check_out_date, '[)') with &&
  )
  where (status in ('confirmed', 'checked_in'));

alter table public.reservations enable row level security;

-- El público NO tiene ninguna policy de SELECT/INSERT/UPDATE/DELETE:
-- por defecto, sin policies que lo permitan, RLS deniega todo acceso a
-- anon. La creación de reservas ocurre exclusivamente a través de la
-- función create_reservation_atomic, llamada desde la Netlify Function
-- con la service role key (que de todas formas ignora RLS).

create policy "reservations_select_staff"
  on public.reservations for select
  to authenticated
  using (public.is_staff_or_admin(auth.uid()));

-- Staff/admin solo pueden editar notas internas de forma directa; los
-- cambios de estado (confirmar, check-in, etc.) pasan siempre por las
-- funciones RPC de 0007_functions.sql, que validan la transición y
-- vuelven a comprobar disponibilidad.
revoke update on public.reservations from authenticated;
grant update (internal_notes) on public.reservations to authenticated;

create policy "reservations_update_internal_notes_staff"
  on public.reservations for update
  to authenticated
  using (public.is_staff_or_admin(auth.uid()))
  with check (public.is_staff_or_admin(auth.uid()));

-- Un futuro cliente autenticado podrá ver sus propias reservas.
create policy "reservations_select_own"
  on public.reservations for select
  to authenticated
  using (user_id = auth.uid());
