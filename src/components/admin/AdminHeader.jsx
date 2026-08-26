import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "../../services/authService";
import { Button } from "../common/Button";

export function AdminHeader({ title, onOpenMenu }) {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-500 sm:inline">
          {profile?.full_name || user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}
