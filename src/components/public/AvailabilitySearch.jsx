import { useState } from "react";
import { DateInput } from "../common/DateInput";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { todayDateOnly, addDays } from "../../utils/dates";
import { validateAvailabilitySearch } from "../../utils/validation";

/**
 * Formulario de búsqueda de disponibilidad. Es "tonto": recibe los
 * valores iniciales y notifica al padre vía onSubmit, que decide si
 * navega a otra página o ejecuta la búsqueda en el sitio.
 */
export function AvailabilitySearch({ initialValues, onSubmit, isLoading, submitLabel = "Buscar disponibilidad" }) {
  const [checkInDate, setCheckInDate] = useState(initialValues?.checkInDate || todayDateOnly());
  const [checkOutDate, setCheckOutDate] = useState(
    initialValues?.checkOutDate || addDays(todayDateOnly(), 1)
  );
  const [guestCount, setGuestCount] = useState(initialValues?.guestCount || 2);
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();
    const criteria = { checkInDate, checkOutDate, guestCount: Number(guestCount) };
    const { isValid, errors: validationErrors } = validateAvailabilitySearch(criteria);
    setErrors(validationErrors);
    if (isValid) onSubmit(criteria);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-5 shadow-md sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
    >
      <DateInput
        id="check-in-date"
        label="Fecha de llegada"
        value={checkInDate}
        min={todayDateOnly()}
        onChange={(event) => setCheckInDate(event.target.value)}
        error={errors.checkInDate}
        required
      />
      <DateInput
        id="check-out-date"
        label="Fecha de salida"
        value={checkOutDate}
        min={checkInDate ? addDays(checkInDate, 1) : undefined}
        onChange={(event) => setCheckOutDate(event.target.value)}
        error={errors.checkOutDate}
        required
      />
      <Input
        id="guest-count"
        type="number"
        min={1}
        max={20}
        label="Huéspedes"
        value={guestCount}
        onChange={(event) => setGuestCount(event.target.value)}
        error={errors.guestCount}
        required
      />
      <Button type="submit" isLoading={isLoading} className="w-full lg:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}
