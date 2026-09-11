import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";
import { formatCurrency, getRoomRateUnitLabel } from "../../utils/currency";
import { Button } from "../common/Button";

/**
 * Card para habitaciones reservables "por horas". Deliberadamente
 * distinto de RoomCard (no solo una variante de precio): en un
 * hospedaje por horas la decisión es más inmediata que en una reserva
 * nocturna, así que el precio por hora va primero y el botón lleva
 * directo a reservar (con hora/duración por defecto ya cargadas en el
 * formulario) en vez de pasar primero por la ficha completa.
 */
export function HourlyRoomCard({ roomType, reservationHref }) {
  const image = roomType.room_images?.[0]?.image_url || siteConfig.images.placeholderRoom;
  const imageAlt = roomType.room_images?.[0]?.alt_text || roomType.name;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-violet-200 bg-white shadow-sm">
      <div className="relative">
        <img src={image} alt={imageAlt} className="h-40 w-full object-cover" loading="lazy" />
        <span className="absolute left-3 top-3 rounded-full bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white">
          Por horas
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900">{roomType.name}</h3>
          <span className="whitespace-nowrap text-lg font-bold text-violet-700">
            {formatCurrency(roomType.hourly_price)}
            <span className="text-xs font-normal text-slate-500"> x {getRoomRateUnitLabel(roomType)}</span>
          </span>
        </div>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-600">{roomType.short_description}</p>
        <p className="mt-2 text-xs text-slate-500">Hasta {roomType.capacity} huéspedes</p>

        <div className="mt-4 flex flex-col gap-2">
          <Link
            to={`/habitaciones/${roomType.id}`}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver habitación
          </Link>
          <Link to={reservationHref ?? `/habitaciones/${roomType.id}/reservar?mode=hourly`} className="w-full">
            <Button className="w-full !bg-violet-600 hover:!bg-violet-700" size="sm">
              Reservar por horas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
