import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SETTLE_WINDOW_MS = 1500;

/**
 * Sincroniza el scroll con la navegación del router. Sin esto, cambiar
 * de ruta con React Router no mueve el scroll (a diferencia de una
 * carga de página normal), y los enlaces con hash (ej. "/#contacto")
 * no hacen nada al navegar desde otra ruta porque el navegador solo
 * auto-scrollea hacia un hash en una carga real de documento.
 *
 * - Si la nueva location trae hash, salta al elemento con ese id.
 * - Si no trae hash, sube al inicio de la página.
 *
 * Corre en cada cambio de `location` (objeto nuevo con `key` distinto
 * en cada navegación), así que también funciona al hacer clic en
 * "Inicio" estando ya en "/".
 *
 * El salto al hash se reintenta mientras el documento cambia de
 * altura (ResizeObserver sobre <body>) durante un par de segundos: la
 * home carga datos de forma asíncrona (cards de habitaciones) y eso
 * puede correr la posición del destino después del primer salto — sin
 * este reajuste, una sección tras otra más larga en cargar queda
 * fuera de lugar.
 */
export function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const id = decodeURIComponent(location.hash.slice(1));
    const scrollToTarget = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ behavior: "auto", block: "start" });
      return true;
    };

    if (!scrollToTarget()) {
      requestAnimationFrame(scrollToTarget);
    }

    const observer = new ResizeObserver(scrollToTarget);
    observer.observe(document.body);

    const stopTimer = setTimeout(() => observer.disconnect(), SETTLE_WINDOW_MS);

    return () => {
      observer.disconnect();
      clearTimeout(stopTimer);
    };
  }, [location]);

  return null;
}
