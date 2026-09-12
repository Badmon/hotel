import { useEffect, useState } from "react";
import { fetchAllActiveServices } from "../services/servicesService";

/** Carga todos los servicios activos (hotel y por habitación), para la vista general de la home. */
export function useAllActiveServices() {
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error | empty

  useEffect(() => {
    let isMounted = true;

    fetchAllActiveServices()
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
