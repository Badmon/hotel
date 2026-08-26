import { useCallback, useState } from "react";
import { searchAvailableRoomTypes, searchAvailableRoomTypesHourly } from "../services/roomsService";
import { validateAvailabilitySearch, validateHourlyAvailabilitySearch } from "../utils/validation";
import { buildLocalDateTimeIso, addHoursIso } from "../utils/dates";
import { BOOKING_MODE } from "../constants/bookingMode";

/**
 * Encapsula el estado de búsqueda de disponibilidad: criterios, carga,
 * error y resultados. Usado por el buscador público, para ambos modos
 * (por noche y por horas) — el modo viene en `criteria.bookingMode`.
 */
export function useAvailability() {
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error | empty
  const [error, setError] = useState(null);
  const [lastSearch, setLastSearch] = useState(null);

  const search = useCallback(async (criteria) => {
    const isHourly = criteria.bookingMode === BOOKING_MODE.HOURLY;
    const { isValid, errors } = isHourly
      ? validateHourlyAvailabilitySearch(criteria)
      : validateAvailabilitySearch(criteria);

    if (!isValid) {
      setStatus("error");
      setError(Object.values(errors)[0]);
      return { isValid: false, errors };
    }

    setStatus("loading");
    setError(null);

    try {
      const rooms = isHourly
        ? await searchAvailableRoomTypesHourly({
            checkInAt: buildLocalDateTimeIso(criteria.checkInDate, criteria.startTime),
            checkOutAt: addHoursIso(
              buildLocalDateTimeIso(criteria.checkInDate, criteria.startTime),
              Number(criteria.durationHours)
            ),
            guestCount: criteria.guestCount,
          })
        : await searchAvailableRoomTypes(criteria);

      setResults(rooms);
      setLastSearch(criteria);
      setStatus(rooms.length === 0 ? "empty" : "success");
      return { isValid: true, errors: {} };
    } catch (err) {
      setStatus("error");
      setError("No fue posible consultar disponibilidad. Inténtalo nuevamente.");
      return { isValid: false, errors: { general: err.message } };
    }
  }, []);

  return { results, status, error, lastSearch, search };
}
