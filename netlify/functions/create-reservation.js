import { getSupabaseAdmin } from "./utils/supabaseAdmin.js";
import { validateCreateReservationInput } from "./utils/validators.js";

/**
 * Creación pública de una solicitud de reserva.
 *
 * Se ejecuta como Netlify Function (no como INSERT directo desde el
 * navegador) porque:
 *  - usa la service role key, que nunca debe llegar al frontend;
 *  - revalida absolutamente todo en el servidor (fechas, capacidad,
 *    disponibilidad) sin confiar en lo que mandó el navegador;
 *  - delega la selección de habitación física y la comprobación de
 *    disponibilidad a la función SQL `create_reservation_atomic`, que
 *    corre dentro de una transacción con bloqueo de fila (FOR UPDATE
 *    SKIP LOCKED) para evitar reservas dobles por condiciones de
 *    carrera cuando dos personas reservan al mismo tiempo.
 *
 * Devuelve únicamente los datos seguros para mostrar al huésped.
 */
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Método no permitido." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Cuerpo de la solicitud inválido." });
  }

  const { isValid, errors, data } = validateCreateReservationInput(body);
  if (!isValid) {
    return jsonResponse(400, { error: errors[0], errors });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: result, error } = await supabaseAdmin.rpc("create_reservation_atomic", {
    p_room_type_id: data.roomTypeId,
    p_booking_mode: data.bookingMode,
    p_check_in: data.checkInDate,
    p_check_out: data.checkOutDate,
    p_check_in_at: data.checkInAt,
    p_check_out_at: data.checkOutAt,
    p_guest_count: data.guestCount,
    p_guest_name: data.guestName,
    p_guest_email: data.guestEmail,
    p_guest_phone: data.guestPhone,
    p_guest_document: data.guestDocument,
    p_notes: data.notes,
  });

  if (error) {
    return jsonResponse(422, { error: mapDatabaseError(error.message) });
  }

  const reservation = Array.isArray(result) ? result[0] : result;

  return jsonResponse(201, {
    reservation: {
      id: reservation.id,
      reservation_code: reservation.reservation_code,
      guest_name: reservation.guest_name,
      status: reservation.status,
      booking_mode: reservation.booking_mode,
      check_in_date: reservation.check_in_date,
      check_out_date: reservation.check_out_date,
      check_in_at: reservation.check_in_at,
      check_out_at: reservation.check_out_at,
    },
  });
}

function mapDatabaseError(message = "") {
  if (message.includes("NO_AVAILABILITY")) {
    return "No hay habitaciones disponibles de este tipo para el horario seleccionado.";
  }
  if (message.includes("CAPACITY_EXCEEDED")) {
    return "La cantidad de huéspedes supera la capacidad de esta habitación.";
  }
  if (message.includes("HOURLY_NOT_ALLOWED")) {
    return "Esta habitación no admite reserva por horas.";
  }
  if (message.includes("ROOM_TYPE_NOT_FOUND")) {
    return "La habitación seleccionada ya no está disponible.";
  }
  if (message.includes("INVALID_DATES")) {
    return "Las fechas u horarios seleccionados no son válidos.";
  }
  return "No fue posible completar tu solicitud. Inténtalo nuevamente.";
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
