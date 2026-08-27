import { useState } from "react";
import { findReservationByCode, findReservationsByContact } from "../../services/reservationsService";
import { getReservationStatusLabel } from "../../constants/reservationStatus";
import { formatDateDisplay, formatDateTimeDisplay } from "../../utils/dates";
import { buildWhatsAppUrl, buildReservationWhatsAppMessage } from "../../utils/whatsapp";
import { BOOKING_MODE } from "../../constants/bookingMode";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { ErrorMessage } from "../../components/common/ErrorMessage";

const MODE = {
  BY_CODE: "by_code",
  BY_CONTACT: "by_contact",
};

export function FindReservationPage() {
  const [mode, setMode] = useState(MODE.BY_CODE);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Buscar mi reserva</h1>
      <p className="mt-2 text-slate-600">
        ¿Perdiste tu código de confirmación? Recupéralo con tus datos de contacto.
      </p>

      <div className="mt-6 inline-flex rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode(MODE.BY_CODE)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === MODE.BY_CODE ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
          aria-pressed={mode === MODE.BY_CODE}
        >
          Tengo el código
        </button>
        <button
          type="button"
          onClick={() => setMode(MODE.BY_CONTACT)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === MODE.BY_CONTACT ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
          aria-pressed={mode === MODE.BY_CONTACT}
        >
          No tengo el código
        </button>
      </div>

      {mode === MODE.BY_CODE ? <SearchByCode /> : <SearchByContact />}
    </div>
  );
}

function SearchByCode() {
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
      setReservation(found);
      setStatus(found ? "found" : "not-found");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="mt-6">
          <ReservationResultCard reservation={reservation} />
        </div>
      )}
    </div>
  );
}

function SearchByContact() {
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | found | not-found | error
  const [reservations, setReservations] = useState([]);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setReservations([]);
    try {
      const found = await findReservationsByContact(guestEmail.trim(), guestPhone.trim());
      setReservations(found);
      setStatus(found.length > 0 ? "found" : "not-found");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="find-contact-email"
          type="email"
          label="Correo electrónico usado al reservar"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          required
        />
        <Input
          id="find-contact-phone"
          type="tel"
          inputMode="tel"
          label="Teléfono usado al reservar"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          required
        />
        <Button type="submit" isLoading={status === "loading"} className="w-full">
          Buscar
        </Button>
      </form>

      {status === "not-found" && (
        <ErrorMessage
          message="No encontramos reservas con ese correo y teléfono. Verifica ambos datos e inténtalo de nuevo."
          className="mt-6"
        />
      )}
      {status === "error" && (
        <ErrorMessage message="No fue posible realizar la búsqueda. Inténtalo nuevamente." className="mt-6" />
      )}
      {status === "found" && (
        <div className="mt-6 space-y-4">
          {reservations.map((reservation) => (
            <ReservationResultCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReservationResultCard({ reservation }) {
  const isHourly = reservation.booking_mode === BOOKING_MODE.HOURLY;
  const whatsappUrl = buildWhatsAppUrl(buildReservationWhatsAppMessage(reservation.reservation_code));

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-900">{reservation.reservation_code}</p>
        <p className="mt-1 text-sm text-slate-600">{reservation.room_type_name}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-xl border border-emerald-100 bg-white p-4 text-sm">
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
