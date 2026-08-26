import { useCallback, useEffect, useState } from "react";
import { fetchReservations } from "../services/reservationsService";

/** Carga reservas para el panel administrativo aplicando filtros. */
export function useReservations(filters) {
  const [reservations, setReservations] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error | empty
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await fetchReservations(filters);
      setReservations(data);
      setStatus(data.length === 0 ? "empty" : "success");
    } catch (err) {
      setError("No fue posible cargar las reservas.");
      setStatus("error");
      // eslint-disable-next-line no-console
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { reservations, status, error, reload };
}
