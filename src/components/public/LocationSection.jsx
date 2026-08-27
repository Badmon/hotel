import { siteConfig } from "../../config/siteConfig";

export function LocationSection() {
  return (
    <section id="ubicacion" className="bg-[var(--color-surface)] py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Ubicación</h2>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Nombre y dirección del hotel
            </p>
            <p className="mt-1 text-slate-700">{siteConfig.hotel.name}</p>
            <p className="mt-1 text-slate-600">{siteConfig.hotel.address}</p>
            <p className="mt-1 text-slate-600">{siteConfig.hotel.schedule}</p>
            <p className="mt-1 text-xs text-slate-400">Puedes mostrarle esto a tu taxista.</p>

            <a
              href={siteConfig.maps.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
            >
              Cómo llegar
            </a>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <iframe
              title="Mapa de ubicación del hotel"
              src={siteConfig.maps.embedUrl}
              className="h-80 w-full lg:h-96"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
