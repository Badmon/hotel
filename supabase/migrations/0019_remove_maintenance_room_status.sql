-- La limpieza cotidiana no se gestiona como estado de inventario.
-- Solo se bloquean habitaciones que realmente estén fuera de servicio.

begin;

-- Se conserva el bloqueo de cualquier habitación ya marcada en
-- mantenimiento: requiere revisión del encargado antes de volver a
-- estar disponible.
update public.rooms
set status = 'disabled'
where status = 'maintenance';

alter table public.rooms
  drop constraint if exists rooms_status_check;

alter table public.rooms
  add constraint rooms_status_check
  check (status in ('available', 'disabled'));

comment on table public.rooms is 'Habitación física. Una habitación deshabilitada nunca debe aparecer disponible.';

commit;
