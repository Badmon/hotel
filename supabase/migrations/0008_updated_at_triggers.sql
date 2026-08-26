-- Mantiene updated_at al día automáticamente en cada UPDATE.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.room_types;
create trigger set_updated_at
  before update on public.room_types
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.rooms;
create trigger set_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.reservations;
create trigger set_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();
