import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{siteConfig.hotel.name}</h3>
          <p className="mt-2 text-sm text-slate-400">{siteConfig.hotel.description}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Navegación</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                {item.href.includes("#") ? (
                  <a href={item.href} className="hover:text-white">
                    {item.label}
                  </a>
                ) : (
                  <Link to={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Contacto</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>{siteConfig.hotel.address}</li>
            <li>{siteConfig.hotel.phone}</li>
            <li>{siteConfig.hotel.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
        © {year} {siteConfig.hotel.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
