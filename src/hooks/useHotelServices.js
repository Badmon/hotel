import { useEffect, useState } from "react";
import { fetchHotelServices } from "../services/servicesService";

/** Carga los servicios de hotel (o "ambos"), que se muestran automáticamente en la home y en toda habitación. */
export function useHotelServices() {
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error | empty

  useEffect(() => {
    let isMounted = true;

    fetchHotelServices()
      .then((data) => {
        if (!isMounted) return;
        setServices(data);
        setStatus(data.length === 0 ? "empty" : "success");
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatus("error");
        // eslint-disable-next-line no-console
        console.error(err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { services, status };
}
