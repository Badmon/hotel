import { useState } from "react";
import { findReservationByCode } from "../../services/reservationsService";
import { getReservationStatusLabel } from "../../constants/reservationStatus";
import { formatDateDisplay, formatDateTimeDisplay } from "../../utils/dates";
import { buildWhatsAppUrl, buildReservationWhatsAppMessage } from "../../utils/whatsapp";
import { BOOKING_MODE } from "../../constants/bookingMode";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { ErrorMessage } from "../../components/common/ErrorMessage";

export function FindReservationPage() {
  const [reservationCode, setReservationCode] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | found | not-found | error
  const [reservation, setReservation] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setReservation(null);
    try {
      const found = await findReservationByCode(reservationCode.trim(), guestEmail.trim());
      if (found) {
        setReservation(found);
        setStatus("found");
      } else {
        setStatus("not-found");
      }
    } catch {
      setStatus("error");
    }
  }

  const isHourly = reservation?.booking_mode === BOOKING_MODE.HOURLY;
  const whatsappUrl = reservation
    ? buildWhatsAppUrl(buildReservationWhatsAppMessage(reservation.reservation_code))
    : null;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Buscar mi reserva</h1>
      <p className="mt-2 text-slate-600">
        ¿Perdiste tu código de confirmación? Ingresa el código y el correo con el que reservaste.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          id="find-reservation-code"
          label="Código de reserva"
          placeholder="HT-2026-XXXXX"
          value={reservationCode}
          onChange={(e) => setReservationCode(e.target.value)}
          required
        />
        <Input
          id="find-reservation-email"
          type="email"
          label="Correo electrónico usado al reservar"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          required
        />
        <Button type="submit" isLoading={status === "loading"} className="w-full">
          Buscar
        </Button>
      </form>

      {status === "not-found" && (
        <ErrorMessage
          message="No encontramos ninguna reserva con ese código y correo. Verifica ambos datos e inténtalo de nuevo."
          className="mt-6"
        />
      )}
      {status === "error" && (
        <ErrorMessage message="No fue posible realizar la búsqueda. Inténtalo nuevamente." className="mt-6" />
      )}

      {status === "found" && reservation && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="text-3xl font-bold text-slate-900">{reservation.reservation_code}</p>
            <p className="mt-2 text-sm text-slate-600">{reservation.room_type_name}</p>
          </div>

          <dl className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-5 text-sm">
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

          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <Button className="w-full">Contactar por WhatsApp</Button>
          </a>
        </div>
      )}
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
