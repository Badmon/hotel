import { Link, useLocation, useNavigate } from "react-router-dom";
import { getReservationStatusLabel } from "../../constants/reservationStatus";
import { formatDateDisplay, formatDateTimeDisplay } from "../../utils/dates";
import { buildWhatsAppUrl, buildReservationWhatsAppMessage } from "../../utils/whatsapp";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { BOOKING_MODE } from "../../constants/bookingMode";

export function ReservationSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const reservation = location.state?.reservation;

  if (!reservation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="No encontramos datos de una solicitud reciente"
          description="Si acabas de enviar una reserva, revisa el correo o mensaje de WhatsApp que recibiste del hotel."
          action={
            <Link to="/habitaciones" className="text-sm font-medium text-[var(--color-primary)]">
              Ver habitaciones
            </Link>
          }
        />
      </div>
    );
  }

  const whatsappUrl = buildWhatsAppUrl(buildReservationWhatsAppMessage(reservation.reservation_code));
  const isHourly = reservation.booking_mode === BOOKING_MODE.HOURLY;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Solicitud recibida correctamente
        </p>
        <p className="mt-3 text-3xl font-bold text-slate-900">{reservation.reservation_code}</p>
        <p className="mt-3 text-sm text-slate-600">
          El hotel revisará tu solicitud y se comunicará contigo para confirmar la disponibilidad.
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-5 text-sm">
        <Row label="Nombre" value={reservation.guest_name} />
        <Row label="Estado" value={getReservationStatusLabel(reservation.status)} />
        {isHourly ? (
          <>
            <Row label="Desde" value={formatDateTimeDisplay(reservation.check_in_at)} />
            <Row label="Hasta" value={formatDateTimeDisplay(reservation.check_out_at)} />
          </>
        ) : (
          <>
            <Row label="Entrada" value={formatDateDisplay(reservation.check_in_date)} />
            <Row label="Salida" value={formatDateDisplay(reservation.check_out_date)} />
          </>
        )}
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex-1">
          <Button className="w-full">Contactar por WhatsApp</Button>
        </a>
        <Button variant="secondary" className="flex-1" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
