import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { signInWithPassword } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { siteConfig } from "../../config/siteConfig";
import { STAFF_ROLES } from "../../constants/userRoles";

export function LoginPage() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated && STAFF_ROLES.includes(role)) {
    const redirectTo = location.state?.from?.pathname || "/admin";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithPassword(email, password);
      navigate("/admin", { replace: true });
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <img src={siteConfig.images.logo} alt={siteConfig.hotel.name} className="mx-auto h-12 w-12" />
          <h1 className="mt-3 text-lg font-semibold text-slate-900">Panel administrativo</h1>
          <p className="text-sm text-slate-500">{siteConfig.hotel.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
          <Input
            id="password"
            type="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <ErrorMessage message={error} />}
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Iniciar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
