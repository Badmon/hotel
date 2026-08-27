import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";

export function MainBanner() {
  return (
    <section className="relative">
      <div className="relative h-[75vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={siteConfig.images.banner}
          alt={siteConfig.hotel.name}
          className="h-full w-full object-cover"
        />
        {/* Vignette suave de borde a borde, para dar profundidad sin tapar la foto. */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/10 to-transparent" />
        {/* Degradado radial localizado detrás del contenido central: oscurece solo
            esa zona para que el texto tenga contraste, dejando el resto de la
            foto visible. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(15,23,42,0.55),rgba(15,23,42,0)_70%)]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="text-3xl font-bold tracking-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.6)] sm:text-5xl">
            {siteConfig.hotel.name}
          </h1>
          <p className="mt-3 max-w-xl text-base font-medium text-white/95 [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] sm:text-lg">
            {siteConfig.hotel.slogan}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/habitaciones"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Ver habitaciones
            </Link>
            <Link
              to="/habitaciones"
              className="rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)]"
            >
              Reservar ahora
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
