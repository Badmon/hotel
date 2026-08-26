import { siteConfig } from "../../config/siteConfig";

const ICONS = {
  wifi: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856a9.75 9.75 0 0 1 13.788 0M1.924 8.674a14.25 14.25 0 0 1 20.152 0M12 18.75h.008v.008H12v-.008Z" />
  ),
  parking: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5v15m0-15h5.25a3.75 3.75 0 1 1 0 7.5H8.25M3.75 3h16.5" />
  ),
  droplet: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c3 4 6 7.28 6 11.13A6 6 0 0 1 6 13.38c0-3.85 3-7.13 6-11.13Z" />
  ),
  tv: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5v11.5H3.75zM8.25 20.25h7.5M12 16.75v3.5" />
  ),
  coffee: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 8.25h12v6a4.5 4.5 0 0 1-4.5 4.5h-3a4.5 4.5 0 0 1-4.5-4.5v-6ZM16.5 9.75h1.5a2.25 2.25 0 0 1 0 4.5h-1.5M6 3.75c0 .621.504 1.125 1.125 1.125S8.25 4.371 8.25 3.75" />
  ),
  concierge: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18.75h18M4.5 18.75V15a7.5 7.5 0 0 1 15 0v3.75M9 18.75v-2.25h6v2.25" />
  ),
};

export function ServicesList() {
  return (
    <section id="servicios" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Servicios</h2>
      <p className="mt-2 max-w-2xl text-slate-600">
        Todo lo que necesitas para una estadía cómoda.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {siteConfig.services.map((service) => (
          <div
            key={service.id}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-7 w-7 text-[var(--color-primary)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              {ICONS[service.icon] ?? ICONS.concierge}
            </svg>
            <span className="text-sm font-medium text-slate-700">{service.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
