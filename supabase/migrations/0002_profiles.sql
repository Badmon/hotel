-- profiles: extiende auth.users con datos propios de la app (nombre,
-- teléfono, rol). Un rol por usuario, entre customer / staff / admin.
--
-- customer no se usa activamente todavía (los huéspedes reservan como
-- invitados), pero se deja modelado desde ya para no tener que migrar
-- después cuando se implemente registro de clientes.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos de perfil y rol de cada usuario autenticado (staff/admin hoy, customer preparado para el futuro).';

alter table public.profiles enable row level security;

-- Se crea automáticamente un profile con rol "customer" cada vez que
-- se registra un usuario en Supabase Auth. Para convertir un usuario
-- en staff/admin, se actualiza profiles.role manualmente (ver
-- supabase/README.md).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'customer');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Función auxiliar usada en policies de otras tablas para saber si el
-- usuario autenticado es staff o admin. SECURITY DEFINER + search_path
-- fijo para evitar recursión de RLS al consultar la propia tabla
-- profiles y para blindarla contra "search_path hijacking".
create or replace function public.is_staff_or_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role in ('staff', 'admin')
  );
$$;

-- Un usuario puede leer y actualizar su propio perfil.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Un usuario puede actualizar su propio nombre/teléfono, pero nunca su
-- propio rol (eso evita que un customer se auto-asigne staff/admin).
-- El cambio de rol solo puede hacerse desde el SQL editor de Supabase
-- o con la service role key.
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Staff/admin pueden leer todos los perfiles (por ejemplo, para
-- mostrar quién gestionó una reserva en el futuro).
create policy "profiles_select_staff"
  on public.profiles for select
  to authenticated
  using (public.is_staff_or_admin(auth.uid()));
