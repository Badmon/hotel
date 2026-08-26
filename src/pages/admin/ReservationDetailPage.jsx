import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchReservationById,
  confirmReservation,
  rejectReservation,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  markReservationNoShow,
} from "../../services/reservationsService";
import { RESERVATION_ACTIONS_BY_STATUS } from "../../constants/reservationStatus";
import { ReservationStatusBadge } from "../../components/admin/ReservationStatusBadge";
import { BookingModeBadge } from "../../components/admin/BookingModeBadge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { formatDateDisplay, formatDateTimeDisplay } from "../../utils/dates";

const ACTIONS = {
  confirm: { label: "Confirmar", variant: "primary", run: confirmReservation, confirmText: "¿Confirmar esta reserva?" },
  reject: { label: "Rechazar", variant: "danger", run: rejectReservation, confirmText: "¿Rechazar esta solicitud de reserva?" },
  cancel: { label: "Cancelar", variant: "danger", run: cancelReservation, confirmText: "¿Cancelar esta reserva?" },
  check_in: { label: "Realizar check-in", variant: "primary", run: checkInReservation, confirmText: "¿Confirmar el check-in de este huésped?" },
  check_out: { label: "Realizar check-out", variant: "primary", run: checkOutReservation, confirmText: "¿Confirmar el check-out de este huésped?" },
  no_show: { label: "Marcar no-show", variant: "danger", run: markReservationNoShow, confirmText: "¿Marcar esta reserva como no presentada?" },
};

export function ReservationDetailPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const load = useCallback(() => {
    setStatus("loading");
    fetchReservationById(id)
      .then((data) => {
        setReservation(data);
        setStatus("success");
      })
      .catch(() => {
        setError("No fue posible cargar la reserva.");
        setStatus("error");
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") return <LoadingSpinner label="Cargando reserva..." />;
  if (status === "error") return <ErrorMessage message={error} onRetry={load} />;
  if (!reservation) return null;

  const availableActions = RESERVATION_ACTIONS_BY_STATUS[reservation.status] ?? [];

  async function handleConfirmAction() {
    if (!pendingAction) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await ACTIONS[pendingAction].run(reservation.id);
      setPendingAction(null);
      load();
    } catch (err) {
      setActionError(err.message || "No fue posible completar la acción.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link to="/admin/reservations" className="text-sm text-slate-500 hover:text-slate-700">
          ← Volver a reservas
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-slate-400">{reservation.reservation_code}</p>
          <h1 className="text-xl font-bold text-slate-900">{reservation.guest_name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <BookingModeBadge bookingMode={reservation.booking_mode} />
          <ReservationStatusBadge status={reservation.status} />
        </div>
      </div>

      {actionError && <ErrorMessage message={actionError} />}

      {availableActions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {availableActions.map((actionKey) => (
            <Button
              key={actionKey}
              variant={ACTIONS[actionKey].variant}
              onClick={() => setPendingAction(actionKey)}
            >
              {ACTIONS[actionKey].label}
            </Button>
          ))}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Datos del huésped</h2>
        <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre" value={reservation.guest_name} />
          <Field label="Documento" value={reservation.guest_document || "—"} />
          <Field label="Teléfono" value={reservation.guest_phone} />
          <Field label="Email" value={reservation.guest_email} />
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Reserva</h2>
        <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Código" value={reservation.reservation_code} />
          <Field label="Habitación" value={`${reservation.rooms?.room_number ?? "—"} · ${reservation.rooms?.room_types?.name ?? ""}`} />
          <Field label="Huéspedes" value={reservation.guest_count} />
          {reservation.booking_mode === "hourly" ? (
            <>
              <Field label="Desde" value={formatDateTimeDisplay(reservation.check_in_at)} />
              <Field label="Hasta" value={formatDateTimeDisplay(reservation.check_out_at)} />
            </>
          ) : (
            <>
              <Field label="Entrada" value={formatDateDisplay(reservation.check_in_date)} />
              <Field label="Salida" value={formatDateDisplay(reservation.check_out_date)} />
            </>
          )}
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Historial</h2>
        <ul className="mt-3 space-y-2">
          {getReservationTimeline(reservation).map((event) => (
            <li key={event.label} className="flex justify-between gap-4 text-sm">
              <span className="text-slate-500">{event.label}</span>
              <span className="font-medium text-slate-800">{formatDateTime(event.value)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Notas</h2>
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs text-slate-400">Notas del huésped</p>
            <p className="text-sm text-slate-700">{reservation.notes || "Sin notas."}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Notas internas (no visibles para el huésped)</p>
            <p className="text-sm text-slate-700">{reservation.internal_notes || "Sin notas internas."}</p>
          </div>
        </div>
      </section>

      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
        title={pendingAction ? ACTIONS[pendingAction].label : ""}
        description={pendingAction ? `${ACTIONS[pendingAction].confirmText} (${reservation.reservation_code})` : ""}
        confirmLabel={pendingAction ? ACTIONS[pendingAction].label : ""}
        variant={pendingAction ? ACTIONS[pendingAction].variant : "primary"}
        isLoading={isProcessing}
      />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Solo incluye los eventos que ya ocurrieron, en orden cronológico. */
function getReservationTimeline(reservation) {
  return [
    { label: "Solicitada", value: reservation.created_at },
    { label: "Confirmada", value: reservation.confirmed_at },
    { label: "Rechazada", value: reservation.rejected_at },
    { label: "Hospedado (check-in)", value: reservation.checked_in_at },
    { label: "Check-out", value: reservation.checked_out_at },
    { label: "Cancelada", value: reservation.cancelled_at },
  ].filter((event) => Boolean(event.value));
}
