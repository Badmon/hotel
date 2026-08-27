import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";
import { formatCurrency } from "../../utils/currency";
import { calculateDiscountPercentage } from "../../utils/promotions";
import { Button } from "../common/Button";

/**
 * Card para tipos de habitación con una promoción vigente. Distinto de
 * RoomCard: precio tachado + precio de oferta + badge de descuento,
 * para que la oferta se note de un vistazo.
 */
export function PromotionRoomCard({ roomType }) {
  const image = roomType.room_images?.[0]?.image_url || siteConfig.images.placeholderRoom;
  const imageAlt = roomType.room_images?.[0]?.alt_text || roomType.name;
  const isHourly = roomType.allows_hourly;
  const regularPrice = isHourly ? roomType.hourly_price : roomType.base_price;
  const discount = calculateDiscountPercentage(regularPrice, roomType.promo_price);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
      <div className="relative">
        <img src={image} alt={imageAlt} className="h-40 w-full object-cover" loading="lazy" />
        <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
          {discount > 0 ? `-${discount}%` : "Oferta"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-slate-900">{roomType.name}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-600">{roomType.short_description}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm text-slate-400 line-through">{formatCurrency(regularPrice)}</span>
          <span className="text-lg font-bold text-amber-700">
            {formatCurrency(roomType.promo_price)}
            <span className="text-xs font-normal text-slate-500">{isHourly ? " por paquete" : " / noche"}</span>
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Hasta {roomType.capacity} huéspedes</p>

        <div className="mt-4 flex flex-col gap-2">
          <Link
            to={`/habitaciones/${roomType.slug}`}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver habitación
          </Link>
          <Link to={`/habitaciones/${roomType.slug}/reservar${isHourly ? "?mode=hourly" : ""}`} className="w-full">
            <Button className="w-full !bg-amber-600 hover:!bg-amber-700" size="sm">
              Aprovechar oferta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
