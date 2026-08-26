import { Link } from "react-router-dom";
import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { BookingModeBadge } from "./BookingModeBadge";
import { formatDateDisplay, formatDateTimeDisplay } from "../../utils/dates";

/** Vista de tarjeta para reservas en móvil, alternativa a la fila de tabla. */
export function ReservationCard({ reservation }) {
  const isHourly = reservation.booking_mode === "hourly";

  return (
    <Link
      to={`/admin/reservations/${reservation.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[var(--color-primary)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-slate-400">{reservation.reservation_code}</p>
          <p className="font-semibold text-slate-900">{reservation.guest_name}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <ReservationStatusBadge status={reservation.status} />
          <BookingModeBadge bookingMode={reservation.booking_mode} />
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
        <div>
          <dt className="text-xs text-slate-400">Habitación</dt>
          <dd>{reservation.rooms?.room_number ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Huéspedes</dt>
          <dd>{reservation.guest_count}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Entrada</dt>
          <dd>{isHourly ? formatDateTimeDisplay(reservation.check_in_at) : formatDateDisplay(reservation.check_in_date)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Salida</dt>
          <dd>{isHourly ? formatDateTimeDisplay(reservation.check_out_at) : formatDateDisplay(reservation.check_out_date)}</dd>
        </div>
      </dl>
    </Link>
  );
}
