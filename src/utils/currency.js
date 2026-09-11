import { siteConfig } from "../config/siteConfig";

/** Formatea un monto numérico usando el símbolo de moneda configurado. */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "";
  const value = Number(amount).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${siteConfig.currency.symbol} ${value}`;
}

/** Unidad de la tarifa según la modalidad del tipo de habitación: "noche", "hora" o "N horas". */
export function getRoomRateUnitLabel(roomType) {
  if (!roomType.allows_hourly) return "noche";
  const hours = roomType.hourly_duration_hours;
  return hours === 1 ? "hora" : `${hours} horas`;
}
