import { siteConfig } from "../../config/siteConfig";

export function LocationSection() {
  return (
    <section id="ubicacion" className="bg-[var(--color-surface)] py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Ubicación</h2>

        <div className="mt-3 grid grid-cols-1 gap-8 lg:grid-cols-4 lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Nombre y dirección del hotel
            </p>
            <p className="mt-1.5 text-slate-700">{siteConfig.hotel.name}</p>
            <p className="text-slate-600">{siteConfig.hotel.address}</p>
            <p className="text-slate-600">{siteConfig.hotel.schedule}</p>

            <a
              href={siteConfig.maps.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
            >
              Cómo llegar
            </a>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm lg:col-span-3">
            <iframe
              title="Mapa de ubicación del hotel"
              src={siteConfig.maps.embedUrl}
              className="h-80 w-full lg:h-[28rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
