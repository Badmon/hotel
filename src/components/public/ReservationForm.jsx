import { useState } from "react";
import { Input } from "../common/Input";
import { DateInput } from "../common/DateInput";
import { Textarea } from "../common/Textarea";
import { Button } from "../common/Button";
import { validateReservationForm } from "../../utils/validation";
import { todayDateOnly } from "../../utils/dates";

/**
 * Formulario de datos del huésped. No envía nada por sí mismo: delega
 * el envío al padre (ReservationRequestPage) vía onSubmit, para poder
 * mostrar antes un resumen de confirmación.
 */
export function ReservationForm({ initialValues, roomCapacity, onSubmit, isSubmitting }) {
  const [values, setValues] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestDocument: "",
    guestCount: initialValues?.guestCount || 1,
    checkInDate: initialValues?.checkInDate || todayDateOnly(),
    checkOutDate: initialValues?.checkOutDate || "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  function handleChange(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const { isValid, errors: validationErrors } = validateReservationForm({
      ...values,
      roomCapacity,
    });
    setErrors(validationErrors);
    if (isValid) onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="guest-name"
        label="Nombre completo"
        value={values.guestName}
        onChange={(e) => handleChange("guestName", e.target.value)}
        error={errors.guestName}
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="guest-phone"
          label="Teléfono / WhatsApp"
          value={values.guestPhone}
          onChange={(e) => handleChange("guestPhone", e.target.value)}
          error={errors.guestPhone}
          required
        />
        <Input
          id="guest-email"
          type="email"
          label="Correo electrónico"
          value={values.guestEmail}
          onChange={(e) => handleChange("guestEmail", e.target.value)}
          error={errors.guestEmail}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="guest-document"
          label="Documento (opcional)"
          value={values.guestDocument}
          onChange={(e) => handleChange("guestDocument", e.target.value)}
        />
        <Input
          id="guest-count"
          type="number"
          min={1}
          max={roomCapacity || 20}
          label="Cantidad de huéspedes"
          value={values.guestCount}
          onChange={(e) => handleChange("guestCount", e.target.value)}
          error={errors.guestCount}
          hint={roomCapacity ? `Capacidad máxima: ${roomCapacity}` : undefined}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateInput
          id="check-in-date"
          label="Fecha de llegada"
          value={values.checkInDate}
          min={todayDateOnly()}
          onChange={(e) => handleChange("checkInDate", e.target.value)}
          error={errors.checkInDate}
          required
        />
        <DateInput
          id="check-out-date"
          label="Fecha de salida"
          value={values.checkOutDate}
          min={values.checkInDate}
          onChange={(e) => handleChange("checkOutDate", e.target.value)}
          error={errors.checkOutDate}
          required
        />
      </div>
      <Textarea
        id="notes"
        label="Comentarios (opcional)"
        rows={3}
        value={values.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
      />
      <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
        Continuar
      </Button>
    </form>
  );
}
