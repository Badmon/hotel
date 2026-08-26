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
