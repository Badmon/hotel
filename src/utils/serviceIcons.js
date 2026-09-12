import {
  Wifi,
  Car,
  Droplet,
  Tv,
  Coffee,
  ConciergeBell,
  Waves,
  Snowflake,
  Dumbbell,
  Shirt,
  Lock,
  PawPrint,
  Bath,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

/** Íconos disponibles para servicios, por clave. "sparkles" es el genérico de respaldo. */
export const SERVICE_ICONS = {
  wifi: Wifi,
  car: Car,
  droplet: Droplet,
  tv: Tv,
  coffee: Coffee,
  "concierge-bell": ConciergeBell,
  waves: Waves,
  snowflake: Snowflake,
  dumbbell: Dumbbell,
  shirt: Shirt,
  lock: Lock,
  "paw-print": PawPrint,
  bath: Bath,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
};

const DEFAULT_ICON = "sparkles";

// Orden importa: la primera coincidencia gana. Palabras clave sin tildes.
const KEYWORD_ICON_MAP = [
  [["wifi", "internet"], "wifi"],
  [["estacionamiento", "parking", "cochera", "garage"], "car"],
  [["agua caliente", "ducha", "jacuzzi", "tina", "hidromasaje"], "bath"],
  [["television", "tv", "cable"], "tv"],
  [["desayuno", "breakfast"], "coffee"],
  [["recepcion", "reception", "concierge"], "concierge-bell"],
  [["piscina", "alberca", "pool"], "waves"],
  [["aire acondicionado", "climatizada", "a/c"], "snowflake"],
  [["gimnasio", "gym"], "dumbbell"],
  [["lavanderia", "laundry"], "shirt"],
  [["caja fuerte", "seguridad", "camaras", "camara"], "lock"],
  [["mascota", "pet"], "paw-print"],
];

/** Deriva un ícono por defecto según palabras clave del nombre del servicio. */
export function getDefaultServiceIcon(name) {
  const normalized = (name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  for (const [keywords, icon] of KEYWORD_ICON_MAP) {
    if (keywords.some((keyword) => normalized.includes(keyword))) return icon;
  }
  return DEFAULT_ICON;
}
