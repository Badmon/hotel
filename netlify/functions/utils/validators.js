/**
 * Validación de la solicitud de reserva en el servidor. Es la fuente
 * de verdad: el frontend valida solo para dar feedback inmediato, pero
 * nunca se confía en esos datos. Aquí se revisa todo de nuevo.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateCreateReservationInput(body) {
  const errors = [];

  const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
  const guestEmail = typeof body.guestEmail === "string" ? body.guestEmail.trim() : "";
  const guestPhone = typeof body.guestPhone === "string" ? body.guestPhone.trim() : "";
  const guestDocument = typeof body.guestDocument === "string" ? body.guestDocument.trim() : null;
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;
  const roomTypeId = typeof body.roomTypeId === "string" ? body.roomTypeId : "";
  const checkInDate = typeof body.checkInDate === "string" ? body.checkInDate : "";
  const checkOutDate = typeof body.checkOutDate === "string" ? body.checkOutDate : "";
  const guestCount = Number(body.guestCount);

  if (guestName.length < 3) errors.push("El nombre completo es obligatorio.");
  if (!EMAIL_REGEX.test(guestEmail)) errors.push("El correo electrónico no es válido.");
  if (guestPhone.length < 6) errors.push("El teléfono no es válido.");
  if (!roomTypeId) errors.push("Debes indicar una habitación válida.");
  if (!DATE_ONLY_REGEX.test(checkInDate)) errors.push("La fecha de llegada no es válida.");
  if (!DATE_ONLY_REGEX.test(checkOutDate)) errors.push("La fecha de salida no es válida.");
  if (DATE_ONLY_REGEX.test(checkInDate) && DATE_ONLY_REGEX.test(checkOutDate) && checkOutDate <= checkInDate) {
    errors.push("La fecha de salida debe ser posterior a la fecha de llegada.");
  }
  if (!Number.isInteger(guestCount) || guestCount < 1) {
    errors.push("La cantidad de huéspedes debe ser al menos 1.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      guestName,
      guestEmail,
      guestPhone,
      guestDocument: guestDocument || null,
      notes: notes || null,
      roomTypeId,
      checkInDate,
      checkOutDate,
      guestCount,
    },
  };
}
