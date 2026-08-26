import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { STAFF_ROLES } from "../../constants/userRoles";
import { LoadingSpinner } from "../common/LoadingSpinner";

/**
 * Protege rutas administrativas: mientras se resuelve la sesión
 * muestra un loader, si no hay sesión redirige al login y si el rol no
 * pertenece a staff/admin también redirige (evita que un customer
 * futuro entre al panel).
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner label="Verificando sesión..." className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!STAFF_ROLES.includes(role)) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
