import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";

export function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[75vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={siteConfig.images.hero}
          alt={siteConfig.hotel.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-slate-900/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{siteConfig.hotel.name}</h1>
          <p className="mt-3 max-w-xl text-base text-white/90 sm:text-lg">{siteConfig.hotel.slogan}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/habitaciones"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Ver habitaciones
            </Link>
            <a
              href="#buscar-disponibilidad"
              className="rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)]"
            >
              Reservar ahora
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
