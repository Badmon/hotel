import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useReservations } from "../../hooks/useReservations";
import { ReservationStatusBadge } from "../../components/admin/ReservationStatusBadge";
import { ReservationCard } from "../../components/admin/ReservationCard";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { DateInput } from "../../components/common/DateInput";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { EmptyState } from "../../components/common/EmptyState";
import { RESERVATION_STATUS, RESERVATION_STATUS_LABELS } from "../../constants/reservationStatus";
import { formatDateDisplay } from "../../utils/dates";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  ...Object.values(RESERVATION_STATUS).map((status) => ({
    value: status,
    label: RESERVATION_STATUS_LABELS[status],
  })),
];

export function ReservationsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: statusFilter || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [search, statusFilter, fromDate, toDate]
  );

  const { reservations, status, error, reload } = useReservations(filters);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          id="search"
          label="Buscar"
          placeholder="Nombre o código"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          id="status-filter"
          label="Estado"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <DateInput id="from-date" label="Desde" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <DateInput id="to-date" label="Hasta" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      {status === "loading" && <LoadingSpinner label="Cargando reservas..." />}
      {status === "error" && <ErrorMessage message={error} onRetry={reload} />}
      {status === "empty" && <EmptyState title="No se encontraron reservas" description="Ajusta los filtros de búsqueda." />}

      {status === "success" && (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Huésped</th>
                  <th className="px-4 py-3">Habitación</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Salida</th>
                  <th className="px-4 py-3">Huéspedes</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{reservation.reservation_code}</td>
                    <td className="px-4 py-3">{reservation.guest_name}</td>
                    <td className="px-4 py-3">{reservation.rooms?.room_number ?? "—"}</td>
                    <td className="px-4 py-3">{formatDateDisplay(reservation.check_in_date)}</td>
                    <td className="px-4 py-3">{formatDateDisplay(reservation.check_out_date)}</td>
                    <td className="px-4 py-3">{reservation.guest_count}</td>
                    <td className="px-4 py-3">
                      <ReservationStatusBadge status={reservation.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/reservations/${reservation.id}`}
                        className="text-sm font-medium text-[var(--color-primary)]"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {reservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
