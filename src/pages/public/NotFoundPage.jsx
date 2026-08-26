import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-slate-600">La página que buscas no existe o fue movida.</p>
      <Link to="/" className="mt-6">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
