export const BOOKING_MODE = {
  NIGHTLY: "nightly",
  HOURLY: "hourly",
};

export const BOOKING_MODE_LABELS = {
  [BOOKING_MODE.NIGHTLY]: "Por noche",
  [BOOKING_MODE.HOURLY]: "Por horas",
};

/** Duraciones ofrecidas en el selector de reserva por horas. */
export const HOURLY_DURATION_OPTIONS = [1, 2, 3, 4, 6, 8, 12];
