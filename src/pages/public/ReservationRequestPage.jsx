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

  async function handleFormSubmit(values) {
    setFormValues(values);
    setStep("review");
  }

  async function handleConfirmSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const reservation = await createReservation({
        roomTypeId: roomType.id,
        guestName: formValues.guestName,
        guestEmail: formValues.guestEmail,
        guestPhone: formValues.guestPhone,
        guestDocument: formValues.guestDocument || null,
        guestCount: Number(formValues.guestCount),
        checkInDate: formValues.checkInDate,
        checkOutDate: formValues.checkOutDate,
        notes: formValues.notes || null,
      });
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
            initialValues={{
              checkInDate: searchParams.get("checkIn"),
              checkOutDate: searchParams.get("checkOut"),
              guestCount: searchParams.get("guests"),
            }}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      {step === "review" && formValues && (
        <div className="mt-6 space-y-6">
          <ReservationSummary
            roomType={roomType}
            checkInDate={formValues.checkInDate}
            checkOutDate={formValues.checkOutDate}
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
