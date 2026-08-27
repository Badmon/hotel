import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { fetchRoomTypeBySlug } from "../../services/roomsService";
import { createReservation } from "../../services/reservationsService";
import { ReservationForm } from "../../components/public/ReservationForm";
import { ReservationSummary } from "../../components/public/ReservationSummary";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "../../components/common/Button";
import { BOOKING_MODE } from "../../constants/bookingMode";
import { buildLocalDateTimeIso, addHoursIso } from "../../utils/dates";

export function ReservationRequestPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [roomType, setRoomType] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [step, setStep] = useState("form"); // form | review
  const [formValues, setFormValues] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchRoomTypeBySlug(slug)
      .then((data) => {
        if (!isMounted) return;
        setRoomType(data);
        setLoadStatus(data ? "success" : "empty");
      })
      .catch(() => isMounted && setLoadStatus("error"));
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loadStatus === "loading") return <LoadingSpinner label="Cargando..." className="min-h-[50vh]" />;
  if (loadStatus === "error") return <ErrorMessage message="No fue posible cargar la habitación." className="mx-auto max-w-2xl my-16" />;
  if (loadStatus === "empty") {
    return (
      <EmptyState
        title="Habitación no encontrada"
        action={<Link to="/habitaciones" className="text-sm font-medium text-[var(--color-primary)]">Ver habitaciones</Link>}
        className="mx-auto max-w-2xl my-16"
      />
    );
  }

  // La modalidad pertenece al tipo de habitación; no se puede cambiar
  // desde la URL.
  const bookingMode = roomType.allows_hourly ? BOOKING_MODE.HOURLY : BOOKING_MODE.NIGHTLY;
  const isHourly = bookingMode === BOOKING_MODE.HOURLY;

  function handleFormSubmit(values) {
    setFormValues(values);
    setSubmitError(null);
    setStep("review");
  }

  async function handleConfirmSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const basePayload = {
        roomTypeId: roomType.id,
        bookingMode,
        guestName: formValues.guestName,
        guestEmail: formValues.guestEmail,
        guestPhone: formValues.guestPhone,
        guestDocument: formValues.guestDocument || null,
        guestCount: Number(formValues.guestCount),
        notes: formValues.notes || null,
      };

      const payload = isHourly
        ? {
            ...basePayload,
            checkInAt: buildLocalDateTimeIso(formValues.checkInDate, formValues.startTime),
          }
        : {
            ...basePayload,
            checkInDate: formValues.checkInDate,
            checkOutDate: formValues.checkOutDate,
          };

      const reservation = await createReservation(payload);
      navigate("/reserva/confirmada", { state: { reservation }, replace: true });
    } catch (error) {
      setSubmitError(error.message || "No fue posible enviar tu solicitud. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Solicitar reserva</h1>
      <p className="mt-1 text-slate-600">
        Habitación seleccionada: <span className="font-semibold text-slate-900">{roomType.name}</span>
      </p>

      {step === "form" && (
        <div className="mt-6">
          <ReservationForm
            roomCapacity={roomType.capacity}
            bookingMode={bookingMode}
            hourlyDurationHours={roomType.hourly_duration_hours}
            initialValues={
              // Al volver a editar, se re-usan los datos que ya había
              // escrito el huésped en vez de los defaults de la URL.
              formValues ?? {
                checkInDate: searchParams.get("checkIn"),
                checkOutDate: searchParams.get("checkOut"),
                startTime: searchParams.get("startTime"),
                guestCount: searchParams.get("guests"),
              }
            }
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      {step === "review" && formValues && (
        <div className="mt-6 space-y-6">
          <ReservationSummary
            roomType={roomType}
            bookingMode={bookingMode}
            checkInDate={formValues.checkInDate}
            checkOutDate={formValues.checkOutDate}
            checkInAt={isHourly ? buildLocalDateTimeIso(formValues.checkInDate, formValues.startTime) : undefined}
            checkOutAt={
              isHourly
                ? addHoursIso(
                    buildLocalDateTimeIso(formValues.checkInDate, formValues.startTime),
                    Number(roomType.hourly_duration_hours)
                  )
                : undefined
            }
            guestCount={formValues.guestCount}
          />

          {submitError && <ErrorMessage message={submitError} />}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setStep("form")} disabled={isSubmitting}>
              Volver a editar
            </Button>
            <Button onClick={handleConfirmSubmit} isLoading={isSubmitting}>
              Enviar solicitud
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
