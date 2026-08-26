import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "../../components/admin/StatCard";
import { ReservationStatusBadge } from "../../components/admin/ReservationStatusBadge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { EmptyState } from "../../components/common/EmptyState";
import {
  fetchDashboardStats,
  fetchTodayArrivals,
  fetchReservations,
} from "../../services/reservationsService";
import { todayDateOnly, formatDateDisplay } from "../../utils/dates";

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [arrivals, setArrivals] = useState([]);
  const [recent, setRecent] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;
    const today = todayDateOnly();

    Promise.all([fetchDashboardStats(today), fetchTodayArrivals(today), fetchReservations()])
      .then(([statsData, arrivalsData, recentData]) => {
        if (!isMounted) return;
        setStats(statsData);
        setArrivals(arrivalsData);
        setRecent(recentData.slice(0, 8));
        setStatus("success");
      })
      .catch(() => isMounted && setStatus("error"));

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "loading") return <LoadingSpinner label="Cargando dashboard..." />;
  if (status === "error") return <ErrorMessage message="No fue posible cargar el dashboard." />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Reservas pendientes" value={stats.pendingCount} />
        <StatCard label="Reservas confirmadas" value={stats.confirmedCount} />
        <StatCard label="Llegadas de hoy" value={stats.todayArrivalsCount} />
        <StatCard label="Huéspedes hospedados" value={stats.checkedInCount} />
        <StatCard label="Salidas de hoy" value={stats.todayDeparturesCount} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Próximas llegadas (hoy)</h2>
        {arrivals.length === 0 ? (
          <EmptyState title="No hay llegadas programadas para hoy" />
        ) : (
          <ReservationsTable reservations={arrivals} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Reservas recientes</h2>
        {recent.length === 0 ? (
          <EmptyState title="Aún no hay reservas" />
        ) : (
          <ReservationsTable reservations={recent} />
        )}
      </section>
    </div>
  );
}

function ReservationsTable({ reservations }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Huésped</th>
            <th className="px-4 py-3">Habitación</th>
            <th className="px-4 py-3">Entrada</th>
            <th className="px-4 py-3">Salida</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reservations.map((reservation) => (
            <tr key={reservation.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link to={`/admin/reservations/${reservation.id}`} className="font-mono text-xs text-[var(--color-primary)]">
                  {reservation.reservation_code}
                </Link>
              </td>
              <td className="px-4 py-3">{reservation.guest_name}</td>
              <td className="px-4 py-3">{reservation.rooms?.room_number ?? "—"}</td>
              <td className="px-4 py-3">{formatDateDisplay(reservation.check_in_date)}</td>
              <td className="px-4 py-3">{formatDateDisplay(reservation.check_out_date)}</td>
              <td className="px-4 py-3">
                <ReservationStatusBadge status={reservation.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
