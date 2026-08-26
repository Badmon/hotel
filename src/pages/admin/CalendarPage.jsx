import { useEffect, useState } from "react";
import { fetchReservationsByDateRange } from "../../services/reservationsService";
import { ReservationStatusBadge } from "../../components/admin/ReservationStatusBadge";
import { BookingModeBadge } from "../../components/admin/BookingModeBadge";
import { DateInput } from "../../components/common/DateInput";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { EmptyState } from "../../components/common/EmptyState";
import { todayDateOnly, addDays, formatDateDisplay, formatDateTimeDisplay } from "../../utils/dates";

/**
 * Vista sencilla de ocupación por rango de fechas. Deliberadamente
 * simple para el MVP: una tabla ordenada por fecha de entrada. Puede
 * reemplazarse más adelante por un calendario visual sin tocar
 * `fetchReservationsByDateRange`, que ya devuelve los datos necesarios.
 */
export function CalendarPage() {
  const [fromDate, setFromDate] = useState(todayDateOnly());
  const [toDate, setToDate] = useState(addDays(todayDateOnly(), 7));
  const [reservations, setReservations] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");
    fetchReservationsByDateRange(fromDate, toDate)
      .then((data) => {
        if (!isMounted) return;
        setReservations(data);
        setStatus(data.length === 0 ? "empty" : "success");
      })
      .catch(() => isMounted && setStatus("error"));
    return () => {
      isMounted = false;
    };
  }, [fromDate, toDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <DateInput id="from-date" label="Desde" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <DateInput id="to-date" label="Hasta" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      {status === "loading" && <LoadingSpinner label="Cargando ocupación..." />}
      {status === "error" && <ErrorMessage message="No fue posible cargar la ocupación." />}
      {status === "empty" && <EmptyState title="No hay reservas en este rango de fechas" />}

      {status === "success" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Entrada</th>
                <th className="px-4 py-3">Salida</th>
                <th className="px-4 py-3">Habitación</th>
                <th className="px-4 py-3">Huésped</th>
                <th className="px-4 py-3">Modo</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {reservation.booking_mode === "hourly"
                      ? formatDateTimeDisplay(reservation.check_in_at)
                      : formatDateDisplay(reservation.check_in_date)}
                  </td>
                  <td className="px-4 py-3">
                    {reservation.booking_mode === "hourly"
                      ? formatDateTimeDisplay(reservation.check_out_at)
                      : formatDateDisplay(reservation.check_out_date)}
                  </td>
                  <td className="px-4 py-3">
                    {reservation.rooms?.room_number ?? "—"} · {reservation.rooms?.room_types?.name ?? ""}
                  </td>
                  <td className="px-4 py-3">{reservation.guest_name}</td>
                  <td className="px-4 py-3">
                    <BookingModeBadge bookingMode={reservation.booking_mode} />
                  </td>
                  <td className="px-4 py-3">
                    <ReservationStatusBadge status={reservation.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
