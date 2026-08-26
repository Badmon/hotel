import { NavLink } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/reservations", label: "Reservas" },
  { to: "/admin/rooms", label: "Habitaciones" },
  { to: "/admin/calendar", label: "Calendario" },
];

export function AdminSidebar({ className = "" }) {
  return (
    <aside className={`flex w-64 flex-col border-r border-slate-200 bg-white ${className}`}>
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <img src={siteConfig.images.logo} alt={siteConfig.hotel.name} className="h-8 w-8" />
        <span className="font-semibold text-slate-900">{siteConfig.hotel.name}</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
