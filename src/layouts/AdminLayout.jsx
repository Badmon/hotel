import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminHeader } from "../components/admin/AdminHeader";
import { ProtectedRoute } from "../components/admin/ProtectedRoute";

// <BrowserRouter> (a diferencia de createBrowserRouter) no expone
// useMatches/handle, así que el título de cada sección se resuelve
// aquí a partir de la ruta actual.
const PAGE_TITLES = [
  { pattern: /^\/admin\/?$/, title: "Dashboard" },
  { pattern: /^\/admin\/reservations\/?$/, title: "Reservas" },
  { pattern: /^\/admin\/reservations\/.+/, title: "Detalle de reserva" },
  { pattern: /^\/admin\/room-types\/?$/, title: "Tipos de habitación" },
  { pattern: /^\/admin\/rooms\/?$/, title: "Habitaciones" },
  { pattern: /^\/admin\/calendar\/?$/, title: "Calendario" },
];

function getPageTitle(pathname) {
  return PAGE_TITLES.find((entry) => entry.pattern.test(pathname))?.title ?? "Panel administrativo";
}

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <AdminSidebar className="hidden lg:flex" />

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/50"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <AdminSidebar className="relative z-10" />
          </div>
        )}

        <div className="flex flex-1 flex-col">
          <AdminHeader title={title} onOpenMenu={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 bg-slate-50 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
