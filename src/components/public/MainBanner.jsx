import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";

export function MainBanner() {
  return (
    <section className="relative">
      <div className="relative h-[60vh] min-h-[336px] w-full overflow-hidden">
        <img
          src={siteConfig.images.banner}
          alt={siteConfig.hotel.name}
          className="h-full w-full object-cover"
        />
        <div className="hero-no-select absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <div className="relative isolate flex flex-col items-center">
            {/* Sombra dimensionada al bloque de contenido (no al hero): closest-side
                hace que llegue a transparente justo en el borde de la caja, así que
                no se ve un rectángulo y el resto de la foto queda intacto. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-24 -inset-y-16 -z-10 bg-[radial-gradient(closest-side,rgba(15,23,42,0.6),rgba(15,23,42,0.35)_55%,rgba(15,23,42,0))]"
            />
            <h1 className="text-3xl font-bold tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.7),0_4px_24px_rgba(0,0,0,0.6)] sm:text-5xl">
              {siteConfig.hotel.name}
            </h1>
            <p className="mt-3 max-w-xl text-base font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8),0_2px_14px_rgba(0,0,0,0.6)] sm:text-lg">
              {siteConfig.hotel.slogan}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/habitaciones"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/40 hover:bg-slate-100"
              >
                Ver habitaciones
              </Link>
              <Link
                to="/habitaciones"
                className="rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/40 hover:bg-[var(--color-primary-dark)]"
              >
                Reservar ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
