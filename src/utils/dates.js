/**
 * Utilidades de fecha para el hotel.
 *
 * check_in_date y check_out_date se tratan como fechas de calendario
 * (YYYY-MM-DD), no como timestamps. Para evitar corrimientos por zona
 * horaria, todo el parseo se hace manualmente en vez de usar
 * `new Date("YYYY-MM-DD")` (que Chrome/Node interpretan en UTC y puede
 * mostrar el día anterior según la zona horaria del usuario).
 */

/** Convierte "YYYY-MM-DD" a un Date local a medianoche, sin desfase de zona horaria. */
export function parseDateOnly(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Convierte un Date a "YYYY-MM-DD" usando la fecha local. */
export function formatDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Formatea "YYYY-MM-DD" como dd/mm/yyyy para mostrar al usuario. */
export function formatDateDisplay(dateString) {
  const date = parseDateOnly(dateString);
  if (!date) return "";
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** "YYYY-MM-DD" de hoy, en horario local. */
export function todayDateOnly() {
  return formatDateOnly(new Date());
}

/** Suma `days` días a una fecha "YYYY-MM-DD" y devuelve "YYYY-MM-DD". */
export function addDays(dateString, days) {
  const date = parseDateOnly(dateString);
  date.setDate(date.getDate() + days);
  return formatDateOnly(date);
}

/**
 * Calcula el número de noches entre dos fechas "YYYY-MM-DD".
 * Devuelve 0 si las fechas son inválidas o checkOut <= checkIn.
 */
export function calculateNights(checkInDate, checkOutDate) {
  const checkIn = parseDateOnly(checkInDate);
  const checkOut = parseDateOnly(checkOutDate);
  if (!checkIn || !checkOut) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay);
  return diff > 0 ? diff : 0;
}

/**
 * Verdadero si el rango [checkIn, checkOut) de una reserva existente se
 * solapa con el rango [checkIn, checkOut) solicitado.
 *
 * Regla: existing.check_in < requested.check_out AND
 *        existing.check_out > requested.check_in
 */
export function dateRangesOverlap(existingCheckIn, existingCheckOut, requestedCheckIn, requestedCheckOut) {
  const a = parseDateOnly(existingCheckIn);
  const b = parseDateOnly(existingCheckOut);
  const c = parseDateOnly(requestedCheckIn);
  const d = parseDateOnly(requestedCheckOut);
  if (!a || !b || !c || !d) return false;
  return a.getTime() < d.getTime() && b.getTime() > c.getTime();
}

/** true si checkOut es estrictamente posterior a checkIn. */
export function isCheckOutAfterCheckIn(checkInDate, checkOutDate) {
  const checkIn = parseDateOnly(checkInDate);
  const checkOut = parseDateOnly(checkOutDate);
  if (!checkIn || !checkOut) return false;
  return checkOut.getTime() > checkIn.getTime();
}

/** true si la fecha "YYYY-MM-DD" no es anterior a hoy. */
export function isTodayOrLater(dateString) {
  const date = parseDateOnly(dateString);
  if (!date) return false;
  const today = parseDateOnly(todayDateOnly());
  return date.getTime() >= today.getTime();
}

/**
 * Utilidades para reservas "por horas". A diferencia de check_in_date/
 * check_out_date (fechas de calendario puras, sin hora), aquí sí
 * trabajamos con instantes concretos (ISO 8601 con hora).
 *
 * buildLocalDateTimeIso asume que quien reserva está en la misma zona
 * horaria que el hotel — razonable para un hotel de una sola sede sin
 * huéspedes reservando desde el otro lado del mundo. Si eso cambia,
 * este es el único lugar que habría que tocar para fijar una zona
 * horaria explícita en vez de usar la del navegador/servidor.
 */

/** Combina "YYYY-MM-DD" + "HH:MM" (hora local) y devuelve un ISO string (instante UTC). */
export function buildLocalDateTimeIso(dateString, timeString) {
  if (!dateString || !timeString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = timeString.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

/** Suma `hours` horas a un instante ISO y devuelve otro ISO string. */
export function addHoursIso(isoString, hours) {
  const date = new Date(isoString);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

/** Diferencia en horas completas entre dos instantes ISO. */
export function calculateHours(checkInIso, checkOutIso) {
  if (!checkInIso || !checkOutIso) return 0;
  const diffMs = new Date(checkOutIso).getTime() - new Date(checkInIso).getTime();
  return diffMs > 0 ? Math.round(diffMs / (1000 * 60 * 60)) : 0;
}

/** Formatea un instante ISO como fecha y hora legibles ("10 sept 2026, 3:00 p.m."). */
export function formatDateTimeDisplay(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
}

/** Formatea solo la hora de un instante ISO ("3:00 p.m."). */
export function formatTimeDisplay(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleString("es-PE", { timeStyle: "short" });
}
