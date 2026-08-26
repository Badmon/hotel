/**
 * Estados internos de una reserva. Usar siempre estas constantes en vez
 * de strings sueltos ("pending", "confirmed", ...) por todo el código.
 */
export const RESERVATION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
  NO_SHOW: "no_show",
};

export const RESERVATION_STATUS_LABELS = {
  [RESERVATION_STATUS.PENDING]: "Pendiente",
  [RESERVATION_STATUS.CONFIRMED]: "Confirmada",
  [RESERVATION_STATUS.CHECKED_IN]: "Hospedado",
  [RESERVATION_STATUS.COMPLETED]: "Completada",
  [RESERVATION_STATUS.CANCELLED]: "Cancelada",
  [RESERVATION_STATUS.REJECTED]: "Rechazada",
  [RESERVATION_STATUS.NO_SHOW]: "No se presentó",
};

/** Clases de color (Tailwind) para el badge de cada estado. */
export const RESERVATION_STATUS_BADGE_STYLES = {
  [RESERVATION_STATUS.PENDING]: "bg-amber-100 text-amber-800",
  [RESERVATION_STATUS.CONFIRMED]: "bg-emerald-100 text-emerald-800",
  [RESERVATION_STATUS.CHECKED_IN]: "bg-sky-100 text-sky-800",
  [RESERVATION_STATUS.COMPLETED]: "bg-slate-200 text-slate-700",
  [RESERVATION_STATUS.CANCELLED]: "bg-red-100 text-red-700",
  [RESERVATION_STATUS.REJECTED]: "bg-red-100 text-red-700",
  [RESERVATION_STATUS.NO_SHOW]: "bg-orange-100 text-orange-800",
};

/**
 * Estados que bloquean disponibilidad de una habitación para fechas
 * que se solapen. El resto de estados no afectan disponibilidad.
 */
export const BLOCKING_RESERVATION_STATUSES = [
  RESERVATION_STATUS.CONFIRMED,
  RESERVATION_STATUS.CHECKED_IN,
];

/**
 * Acciones administrativas válidas según el estado actual de la reserva.
 * La UI debe mostrar únicamente las acciones listadas aquí para el
 * estado correspondiente.
 */
export const RESERVATION_ACTIONS_BY_STATUS = {
  [RESERVATION_STATUS.PENDING]: ["confirm", "reject", "cancel"],
  [RESERVATION_STATUS.CONFIRMED]: ["check_in", "cancel", "no_show"],
  [RESERVATION_STATUS.CHECKED_IN]: ["check_out"],
  [RESERVATION_STATUS.COMPLETED]: [],
  [RESERVATION_STATUS.CANCELLED]: [],
  [RESERVATION_STATUS.REJECTED]: [],
  [RESERVATION_STATUS.NO_SHOW]: [],
};

export function getReservationStatusLabel(status) {
  return RESERVATION_STATUS_LABELS[status] ?? status;
}
