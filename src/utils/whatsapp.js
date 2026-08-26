import { siteConfig } from "../config/siteConfig";

/**
 * Construye una URL de wa.me con mensaje pre-cargado, usando el número
 * configurado en siteConfig. Reutilizar siempre esta función en vez de
 * armar el enlace manualmente en cada componente.
 */
export function buildWhatsAppUrl(message = "") {
  const phone = siteConfig.hotel.whatsapp;
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}${text ? `?text=${text}` : ""}`;
}

export function buildReservationWhatsAppMessage(reservationCode) {
  return `Hola, acabo de realizar la solicitud de reserva ${reservationCode}. Quisiera confirmar la disponibilidad.`;
}
