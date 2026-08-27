-- La home ya organiza las habitaciones por modalidad y promociones;
-- no se necesita una marca manual adicional de destacadas.

alter table public.room_types
  drop column if exists featured;
