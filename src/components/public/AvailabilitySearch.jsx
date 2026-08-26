import { useState } from "react";
import { DateInput } from "../common/DateInput";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { todayDateOnly, addDays } from "../../utils/dates";
import { validateAvailabilitySearch, validateHourlyAvailabilitySearch } from "../../utils/validation";
import { BOOKING_MODE, BOOKING_MODE_LABELS, HOURLY_DURATION_OPTIONS } from "../../constants/bookingMode";

const DURATION_OPTIONS = HOURLY_DURATION_OPTIONS.map((hours) => ({
  value: String(hours),
  label: `${hours} ${hours === 1 ? "hora" : "horas"}`,
}));

/**
 * Formulario de búsqueda de disponibilidad. Es "tonto": recibe los
 * valores iniciales y notifica al padre vía onSubmit, que decide si
 * navega a otra página o ejecuta la búsqueda en el sitio. Soporta dos
 * modos (por noche / por horas) mediante un selector; el padre recibe
 * siempre `criteria.bookingMode` para saber cuál se usó.
 */
export function AvailabilitySearch({
  initialValues,
  onSubmit,
  isLoading,
  submitLabel = "Buscar disponibilidad",
  allowHourly = true,
}) {
  const [bookingMode, setBookingMode] = useState(initialValues?.bookingMode || BOOKING_MODE.NIGHTLY);
  const [checkInDate, setCheckInDate] = useState(initialValues?.checkInDate || todayDateOnly());
  const [checkOutDate, setCheckOutDate] = useState(
    initialValues?.checkOutDate || addDays(todayDateOnly(), 1)
  );
  const [startTime, setStartTime] = useState(initialValues?.startTime || "14:00");
  const [durationHours, setDurationHours] = useState(initialValues?.durationHours || 3);
  const [guestCount, setGuestCount] = useState(initialValues?.guestCount || 2);
  const [errors, setErrors] = useState({});

  const isHourly = bookingMode === BOOKING_MODE.HOURLY;

  function handleSubmit(event) {
    event.preventDefault();

    if (isHourly) {
      const criteria = {
        bookingMode: BOOKING_MODE.HOURLY,
        checkInDate,
        startTime,
        durationHours: Number(durationHours),
        guestCount: Number(guestCount),
      };
      const { isValid, errors: validationErrors } = validateHourlyAvailabilitySearch(criteria);
      setErrors(validationErrors);
      if (isValid) onSubmit(criteria);
      return;
    }

    const criteria = {
      bookingMode: BOOKING_MODE.NIGHTLY,
      checkInDate,
      checkOutDate,
      guestCount: Number(guestCount),
    };
    const { isValid, errors: validationErrors } = validateAvailabilitySearch(criteria);
    setErrors(validationErrors);
    if (isValid) onSubmit(criteria);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-5 pt-6 shadow-md sm:p-6 sm:pt-7">
      {allowHourly && (
        <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-1">
          {Object.values(BOOKING_MODE).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setBookingMode(mode)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                bookingMode === mode ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
              aria-pressed={bookingMode === mode}
            >
              {BOOKING_MODE_LABELS[mode]}
            </button>
          ))}
        </div>
      )}

      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:items-end ${
          isHourly ? "lg:grid-cols-[1fr_1fr_1fr_1fr_auto]" : "lg:grid-cols-[1fr_1fr_1fr_auto]"
        }`}
      >
        {isHourly ? (
          <>
            <DateInput
              id="check-in-date"
              label="Fecha"
              value={checkInDate}
              min={todayDateOnly()}
              onChange={(event) => setCheckInDate(event.target.value)}
              error={errors.checkInDate}
              required
            />
            <Input
              id="start-time"
              type="time"
              label="Hora de llegada"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              error={errors.startTime}
              required
            />
            <Select
              id="duration-hours"
              label="Duración"
              options={DURATION_OPTIONS}
              value={String(durationHours)}
              onChange={(event) => setDurationHours(event.target.value)}
              error={errors.durationHours}
            />
          </>
        ) : (
          <>
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
          </>
        )}

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
      </div>
    </form>
  );
}
