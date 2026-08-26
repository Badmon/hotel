import { todayDateOnly } from "./dates";

/**
 * Una promoción está vigente si el tipo la tiene activada y, cuando
 * hay fechas de inicio/fin, hoy cae dentro del rango. Fechas vacías no
 * acotan ese lado (sin promo_starts_at = ya empezó; sin promo_ends_at
 * = no vence). Cálculo en el cliente a propósito: es una regla de
 * presentación sobre datos públicos, no algo que proteger en el server.
 */
export function isPromotionActive(roomType) {
  if (!roomType?.on_promotion || !roomType.promo_price) return false;

  const today = todayDateOnly();
  if (roomType.promo_starts_at && roomType.promo_starts_at > today) return false;
  if (roomType.promo_ends_at && roomType.promo_ends_at < today) return false;

  return true;
}

/** Porcentaje de descuento redondeado, para mostrar como "-25%". */
export function calculateDiscountPercentage(basePrice, promoPrice) {
  if (!basePrice || !promoPrice || promoPrice >= basePrice) return 0;
  return Math.round(((basePrice - promoPrice) / basePrice) * 100);
}
