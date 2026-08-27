/**
 * Validación de la solicitud de reserva en el servidor. Es la fuente
 * de verdad: el frontend valida solo para dar feedback inmediato, pero
 * nunca se confía en esos datos. Aquí se revisa todo de nuevo.
 *
 * Soporta dos modos, distinguidos por `bookingMode`:
 *  - "nightly": requiere checkInDate/checkOutDate ("YYYY-MM-DD").
 *  - "hourly": requiere checkInAt (ISO 8601 con hora) — el checkout es
 *    un paquete fijo del tipo de habitación (hourly_duration_hours),
 *    se calcula en la base de datos, nunca lo manda el cliente.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDateTime(value) {
  if (typeof value !== "string" || !value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function validateCreateReservationInput(body) {
  const errors = [];

  const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
  const guestEmail = typeof body.guestEmail === "string" ? body.guestEmail.trim() : "";
  const guestPhone = typeof body.guestPhone === "string" ? body.guestPhone.trim() : "";
  const guestDocument = typeof body.guestDocument === "string" ? body.guestDocument.trim() : null;
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;
  // room_types.id es un entero autoincremental (ver
  // 0016_sequential_room_ids.sql), no un uuid: acá puede llegar como
  // number (fetch con JSON) o string, según lo mande el cliente.
  const roomTypeId = Number(body.roomTypeId);
  const guestCount = Number(body.guestCount);
  const bookingMode = body.bookingMode === "hourly" ? "hourly" : "nightly";

  if (guestName.length < 3) errors.push("El nombre completo es obligatorio.");
  if (!EMAIL_REGEX.test(guestEmail)) errors.push("El correo electrónico no es válido.");
  if (guestPhone.length < 6) errors.push("El teléfono no es válido.");
  if (!Number.isInteger(roomTypeId) || roomTypeId < 1) errors.push("Debes indicar una habitación válida.");
  if (!Number.isInteger(guestCount) || guestCount < 1) {
    errors.push("La cantidad de huéspedes debe ser al menos 1.");
  }

  const data = {
    guestName,
    guestEmail,
    guestPhone,
    guestDocument: guestDocument || null,
    notes: notes || null,
    roomTypeId,
    guestCount,
    bookingMode,
    checkInDate: null,
    checkOutDate: null,
    checkInAt: null,
  };

  if (bookingMode === "nightly") {
    const checkInDate = typeof body.checkInDate === "string" ? body.checkInDate : "";
    const checkOutDate = typeof body.checkOutDate === "string" ? body.checkOutDate : "";

    if (!DATE_ONLY_REGEX.test(checkInDate)) errors.push("La fecha de llegada no es válida.");
    if (!DATE_ONLY_REGEX.test(checkOutDate)) errors.push("La fecha de salida no es válida.");
    if (DATE_ONLY_REGEX.test(checkInDate) && DATE_ONLY_REGEX.test(checkOutDate) && checkOutDate <= checkInDate) {
      errors.push("La fecha de salida debe ser posterior a la fecha de llegada.");
    }

    data.checkInDate = checkInDate;
    data.checkOutDate = checkOutDate;
  } else {
    // El checkout ya no lo manda el cliente: es un paquete fijo por
    // tipo de habitación (room_types.hourly_duration_hours), calculado
    // server-side dentro de create_reservation_atomic.
    const checkInAt = body.checkInAt;

    if (!isValidIsoDateTime(checkInAt)) errors.push("La hora de llegada no es válida.");

    data.checkInAt = checkInAt;
  }

  return { isValid: errors.length === 0, errors, data };
}
