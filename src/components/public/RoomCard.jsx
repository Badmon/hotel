import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";
import { formatCurrency } from "../../utils/currency";
import { Button } from "../common/Button";
import { BOOKING_MODE } from "../../constants/bookingMode";

export function RoomCard({ roomType, reservationHref, bookingMode = BOOKING_MODE.NIGHTLY }) {
  const image = roomType.room_images?.[0]?.image_url || siteConfig.images.placeholderRoom;
  const imageAlt = roomType.room_images?.[0]?.alt_text || roomType.name;

  const isHourly = bookingMode === BOOKING_MODE.HOURLY;
  const priceLabel = isHourly
    ? `Desde ${formatCurrency(roomType.hourly_price)} / hora`
    : `Desde ${formatCurrency(roomType.base_price)} / noche`;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <img src={image} alt={imageAlt} className="h-48 w-full object-cover" loading="lazy" />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-slate-900">{roomType.name}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-600">
          {roomType.short_description}
        </p>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
          <span>Hasta {roomType.capacity} huéspedes</span>
          <span className="font-semibold text-slate-900">{priceLabel}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            to={`/habitaciones/${roomType.slug}`}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver habitación
          </Link>
          <Link to={reservationHref ?? `/habitaciones/${roomType.slug}`} className="flex-1">
            <Button className="w-full" size="sm">
              Reservar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
