-- room_types: el tipo comercial de habitación (Matrimonial, Doble,
-- Familiar, Suite...). No es una habitación física: varias rooms
-- pueden compartir el mismo room_type (ver 0004_rooms.sql).

create table if not exists public.room_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  capacity integer not null check (capacity > 0),
  base_price numeric(10, 2) not null check (base_price >= 0),
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.room_types is 'Tipo comercial de habitación (p. ej. "Matrimonial"). Ver rooms para las habitaciones físicas.';

alter table public.room_types enable row level security;

-- Público: solo tipos activos.
create policy "room_types_select_public"
  on public.room_types for select
  to anon, authenticated
  using (active = true);

-- Staff/admin: ven todo (incluye inactivos) y administran.
create policy "room_types_select_staff"
  on public.room_types for select
  to authenticated
  using (public.is_staff_or_admin(auth.uid()));

create policy "room_types_write_staff"
  on public.room_types for all
  to authenticated
  using (public.is_staff_or_admin(auth.uid()))
  with check (public.is_staff_or_admin(auth.uid()));
