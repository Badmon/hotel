export const ROOM_STATUS = {
  AVAILABLE: "available",
  DISABLED: "disabled",
};

export const ROOM_STATUS_LABELS = {
  [ROOM_STATUS.AVAILABLE]: "Disponible",
  [ROOM_STATUS.DISABLED]: "Deshabilitada",
};

export const ROOM_STATUS_BADGE_STYLES = {
  [ROOM_STATUS.AVAILABLE]: "bg-emerald-100 text-emerald-800",
  [ROOM_STATUS.DISABLED]: "bg-slate-200 text-slate-700",
};
