import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Principal">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <img src={siteConfig.images.logo} alt={siteConfig.hotel.name} className="h-9 w-9" />
          <span className="text-lg">{siteConfig.hotel.name}</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {siteConfig.nav.map((item) =>
            item.href.includes("#") ? (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-[var(--color-primary)]"
              >
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-[var(--color-primary)] ${
                    isActive ? "text-[var(--color-primary)]" : "text-slate-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
          <Link
            to="/habitaciones"
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
          >
            Reservar
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {siteConfig.nav.map((item) =>
              item.href.includes("#") ? (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-medium text-slate-700"
                >
                  {item.label}
                </Link>
              ) : (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-medium text-slate-700"
                >
                  {item.label}
                </NavLink>
              )
            )}
            <Link
              to="/habitaciones"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              Reservar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
