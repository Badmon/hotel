import { useAllActiveServices } from "../../hooks/useAllActiveServices";
import { ServiceIcon } from "../common/ServiceIcon";

export function ServicesList() {
  const { services, status } = useAllActiveServices();

  // Sección puramente decorativa: si no hay servicios cargados o falló
  // la consulta, mejor no mostrar nada a que se vea una sección rota o vacía.
  if (status === "error" || status === "empty") return null;

  return (
    <section id="servicios" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Servicios</h2>
      <p className="mt-2 max-w-2xl text-slate-600">
        Todo lo que necesitas para una estadía cómoda.
      </p>
      <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(140px,160px))] justify-center gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-center"
          >
            <ServiceIcon icon={service.icon} className="h-7 w-7 text-[var(--color-primary)]" />
            <span className="text-sm font-medium text-slate-700">{service.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
