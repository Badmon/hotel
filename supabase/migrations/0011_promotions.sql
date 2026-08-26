-- Promociones: un descuento opcional por tipo de habitación, con
-- vigencia opcional (fecha de inicio / fin). Deliberadamente simple:
-- una sola promoción activa a la vez por tipo, viviendo en la misma
-- tabla room_types (sin tabla nueva, sin RLS nueva, sin CRUD nuevo —
-- se edita desde el mismo formulario de /admin/room-types).
--
-- "¿Está vigente ahora mismo?" no se resuelve en SQL: se calcula en el
-- cliente (utils/promotions.js), igual que cualquier otra regla de
-- presentación pública que no protege datos sensibles. Si más adelante
-- se necesitan varias promociones por tipo (historial, programación a
-- futuro), eso sí amerita una tabla `promotions` aparte.

alter table public.room_types
  add column if not exists on_promotion boolean not null default false,
  add column if not exists promo_price numeric(10, 2),
  add column if not exists promo_starts_at date,
  add column if not exists promo_ends_at date;

alter table public.room_types
  add constraint room_types_promotion_price_check
  check (on_promotion = false or (promo_price is not null and promo_price > 0 and promo_price < base_price));

alter table public.room_types
  add constraint room_types_promotion_dates_check
  check (promo_starts_at is null or promo_ends_at is null or promo_ends_at >= promo_starts_at);
