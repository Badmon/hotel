import { useCallback, useState } from "react";
import { searchAvailableRoomTypes } from "../services/roomsService";
import { validateAvailabilitySearch } from "../utils/validation";

/**
 * Encapsula el estado de búsqueda de disponibilidad: criterios, carga,
 * error y resultados. Usado por el buscador público.
 */
export function useAvailability() {
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error | empty
  const [error, setError] = useState(null);
  const [lastSearch, setLastSearch] = useState(null);

  const search = useCallback(async (criteria) => {
    const { isValid, errors } = validateAvailabilitySearch(criteria);
    if (!isValid) {
      setStatus("error");
      setError(Object.values(errors)[0]);
      return { isValid: false, errors };
    }

    setStatus("loading");
    setError(null);

    try {
      const rooms = await searchAvailableRoomTypes(criteria);
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
