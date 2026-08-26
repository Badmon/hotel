/**
 * Validaciones de formulario para el frontend. Esto es solamente
 * feedback inmediato para el usuario: la validación que realmente
 * protege los datos vive en la Netlify Function
 * (netlify/functions/create-reservation.js) y en la base de datos.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d][\d\s-]{6,20}$/;

export function validateReservationForm({
  guestName,
  guestEmail,
  guestPhone,
  guestCount,
  checkInDate,
  checkOutDate,
  roomCapacity,
}) {
  const errors = {};

  if (!guestName || guestName.trim().length < 3) {
    errors.guestName = "Ingresa tu nombre completo.";
  }

  if (!guestEmail || !EMAIL_REGEX.test(guestEmail.trim())) {
    errors.guestEmail = "Ingresa un correo electrónico válido.";
  }

  if (!guestPhone || !PHONE_REGEX.test(guestPhone.trim())) {
    errors.guestPhone = "Ingresa un teléfono válido.";
  }

  const guests = Number(guestCount);
  if (!Number.isInteger(guests) || guests < 1) {
    errors.guestCount = "La cantidad de huéspedes debe ser al menos 1.";
  } else if (roomCapacity && guests > roomCapacity) {
    errors.guestCount = `Esta habitación admite hasta ${roomCapacity} huéspedes.`;
  }

  if (!checkInDate) {
    errors.checkInDate = "Selecciona la fecha de llegada.";
  }

  if (!checkOutDate) {
    errors.checkOutDate = "Selecciona la fecha de salida.";
  }

  if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
    errors.checkOutDate = "La fecha de salida debe ser posterior a la de llegada.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateAvailabilitySearch({ checkInDate, checkOutDate, guestCount }) {
  const errors = {};

  if (!checkInDate) errors.checkInDate = "Selecciona la fecha de llegada.";
  if (!checkOutDate) errors.checkOutDate = "Selecciona la fecha de salida.";
  if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
    errors.checkOutDate = "La fecha de salida debe ser posterior a la de llegada.";
  }

  const guests = Number(guestCount);
  if (!Number.isInteger(guests) || guests < 1) {
    errors.guestCount = "Indica al menos 1 huésped.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateHourlyAvailabilitySearch({ checkInDate, startTime, durationHours, guestCount }) {
  const errors = {};

  if (!checkInDate) errors.checkInDate = "Selecciona la fecha.";
  if (!startTime) errors.startTime = "Selecciona la hora de llegada.";

  const duration = Number(durationHours);
  if (!Number.isInteger(duration) || duration < 1 || duration > 12) {
    errors.durationHours = "La duración debe ser entre 1 y 12 horas.";
  }

  const guests = Number(guestCount);
  if (!Number.isInteger(guests) || guests < 1) {
    errors.guestCount = "Indica al menos 1 huésped.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateHourlyReservationForm({
  guestName,
  guestEmail,
  guestPhone,
  guestCount,
  checkInDate,
  startTime,
  durationHours,
  roomCapacity,
}) {
  const errors = {};

  if (!guestName || guestName.trim().length < 3) {
    errors.guestName = "Ingresa tu nombre completo.";
  }
  if (!guestEmail || !EMAIL_REGEX.test(guestEmail.trim())) {
    errors.guestEmail = "Ingresa un correo electrónico válido.";
  }
  if (!guestPhone || !PHONE_REGEX.test(guestPhone.trim())) {
    errors.guestPhone = "Ingresa un teléfono válido.";
  }

  const guests = Number(guestCount);
  if (!Number.isInteger(guests) || guests < 1) {
    errors.guestCount = "La cantidad de huéspedes debe ser al menos 1.";
  } else if (roomCapacity && guests > roomCapacity) {
    errors.guestCount = `Esta habitación admite hasta ${roomCapacity} huéspedes.`;
  }

  if (!checkInDate) errors.checkInDate = "Selecciona la fecha.";
  if (!startTime) errors.startTime = "Selecciona la hora de llegada.";

  const duration = Number(durationHours);
  if (!Number.isInteger(duration) || duration < 1 || duration > 12) {
    errors.durationHours = "La duración debe ser entre 1 y 12 horas.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
