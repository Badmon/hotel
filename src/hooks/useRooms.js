import { useEffect, useState } from "react";
import { fetchActiveRoomTypesWithImages } from "../services/roomsService";

/** Carga los tipos de habitación activos, para la página pública de habitaciones. */
export function useRooms() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error | empty
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchActiveRoomTypesWithImages()
      .then((data) => {
        if (!isMounted) return;
        setRoomTypes(data);
        setStatus(data.length === 0 ? "empty" : "success");
      })
      .catch((err) => {
        if (!isMounted) return;
        setError("No fue posible cargar las habitaciones.");
        setStatus("error");
        // eslint-disable-next-line no-console
        console.error(err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { roomTypes, status, error };
}
