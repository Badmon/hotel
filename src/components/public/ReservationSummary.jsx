import { formatCurrency } from "../../utils/currency";
import { formatDateDisplay, calculateNights, formatDateTimeDisplay, calculateHours } from "../../utils/dates";
import { isPromotionActive } from "../../utils/promotions";
import { BOOKING_MODE } from "../../constants/bookingMode";

export function ReservationSummary({ roomType, bookingMode, checkInDate, checkOutDate, checkInAt, checkOutAt, guestCount }) {
  const isHourly = bookingMode === BOOKING_MODE.HOURLY;
  const onPromotion = isPromotionActive(roomType);
  const nightlyRate = onPromotion ? roomType.promo_price : roomType?.base_price;

  const nights = isHourly ? null : calculateNights(checkInDate, checkOutDate);
  const hours = isHourly ? calculateHours(checkInAt, checkOutAt) : null;

  // hourly_price es el precio del paquete completo (fijo, no una
  // tarifa por hora), así que no se multiplica por la duración.
  const referencePrice = isHourly
    ? (onPromotion ? roomType?.promo_price : roomType?.hourly_price) || null
    : nightlyRate
      ? nightlyRate * nights
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Resumen de la reserva
      </h3>
      <dl className="mt-3 space-y-2 text-sm">
        <Row label="Habitación" value={roomType?.name} />
        {isHourly ? (
          <>
            <Row label="Desde" value={formatDateTimeDisplay(checkInAt)} />
            <Row label="Hasta" value={formatDateTimeDisplay(checkOutAt)} />
            <Row label="Duración" value={hours ? `${hours} ${hours === 1 ? "hora" : "horas"}` : "—"} />
          </>
        ) : (
          <>
            <Row label="Entrada" value={formatDateDisplay(checkInDate)} />
            <Row label="Salida" value={formatDateDisplay(checkOutDate)} />
            <Row label="Noches" value={nights} />
          </>
        )}
        <Row label="Huéspedes" value={guestCount} />
        {referencePrice !== null && (
          <Row
            label={onPromotion ? "Precio referencial (con oferta)" : "Precio referencial"}
            value={formatCurrency(referencePrice)}
          />
        )}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        El pago se realizará directamente en el hotel. Esta solicitud no representa un cobro en línea.
      </p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value ?? "—"}</dd>
    </div>
  );
}
