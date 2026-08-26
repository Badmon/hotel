-- room_images: varias imágenes por tipo de habitación, ordenadas.

create table if not exists public.room_images (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types (id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists room_images_room_type_id_idx on public.room_images (room_type_id);

alter table public.room_images enable row level security;

create policy "room_images_select_public"
  on public.room_images for select
  to anon, authenticated
  using (true);

create policy "room_images_write_staff"
  on public.room_images for all
  to authenticated
  using (public.is_staff_or_admin(auth.uid()))
  with check (public.is_staff_or_admin(auth.uid()));
