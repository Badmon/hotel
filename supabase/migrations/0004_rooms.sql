-- rooms: la habitación física (número, piso, estado). Varias rooms
-- pueden pertenecer al mismo room_type.

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null unique,
  room_type_id uuid not null references public.room_types (id) on delete restrict,
  floor text,
  status text not null default 'available' check (status in ('available', 'maintenance', 'disabled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.rooms is 'Habitación física. Una habitación en maintenance/disabled nunca debe aparecer disponible.';

create index if not exists rooms_room_type_id_idx on public.rooms (room_type_id);

alter table public.rooms enable row level security;

-- Público: puede leer habitaciones (necesario para calcular
-- disponibilidad desde el cliente si hiciera falta), pero solo campos
-- no sensibles; no hay nada privado en esta tabla.
create policy "rooms_select_public"
  on public.rooms for select
  to anon, authenticated
  using (true);

create policy "rooms_write_staff"
  on public.rooms for all
  to authenticated
  using (public.is_staff_or_admin(auth.uid()))
  with check (public.is_staff_or_admin(auth.uid()));
