import { formatCurrency } from "../../utils/currency";
import { formatDateDisplay, calculateNights } from "../../utils/dates";

export function ReservationSummary({ roomType, checkInDate, checkOutDate, guestCount }) {
  const nights = calculateNights(checkInDate, checkOutDate);
  const referencePrice = roomType?.base_price ? roomType.base_price * nights : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Resumen de la reserva
      </h3>
      <dl className="mt-3 space-y-2 text-sm">
        <Row label="Habitación" value={roomType?.name} />
        <Row label="Entrada" value={formatDateDisplay(checkInDate)} />
        <Row label="Salida" value={formatDateDisplay(checkOutDate)} />
        <Row label="Noches" value={nights} />
        <Row label="Huéspedes" value={guestCount} />
        {referencePrice !== null && (
          <Row label="Precio referencial" value={formatCurrency(referencePrice)} />
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
