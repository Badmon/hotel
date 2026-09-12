import { useCallback, useEffect, useState } from "react";
import {
  fetchServicesForAdmin,
  createService,
  updateService,
  deleteService,
} from "../../services/servicesService";
import { SERVICE_TYPE, SERVICE_TYPE_LABELS } from "../../constants/serviceType";
import { Badge } from "../../components/common/Badge";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { EmptyState } from "../../components/common/EmptyState";
import { ServiceIcon } from "../../components/common/ServiceIcon";

const TYPE_BADGE_STYLES = {
  [SERVICE_TYPE.HOTEL]: "bg-sky-100 text-sky-800",
  [SERVICE_TYPE.ROOM]: "bg-violet-100 text-violet-800",
};

export function ServicesAdminPage() {
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [editingService, setEditingService] = useState(null); // null = cerrado, {} = nuevo, {...} = editar
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deletingService, setDeletingService] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const load = useCallback(() => {
    setStatus("loading");
    fetchServicesForAdmin()
      .then((data) => {
        setServices(data);
        setStatus(data.length === 0 ? "empty" : "success");
      })
      .catch(() => {
        setError("No fue posible cargar los servicios.");
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values) {
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingService?.id) {
        await updateService(editingService.id, values);
      } else {
        await createService(values);
      }
      setEditingService(null);
      load();
    } catch (err) {
      setFormError(err.message || "No fue posible guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteService(deletingService.id);
      setDeletingService(null);
      load();
    } catch (err) {
      setDeleteError(err.message || "No fue posible eliminar este servicio.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (status === "loading") return <LoadingSpinner label="Cargando servicios..." />;
  if (status === "error") return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Servicios "todo el hotel" se muestran automáticamente en la home y en toda habitación. Los de "por
          tipo de habitación" se asignan desde cada tipo en "Tipos de habitación".
        </p>
        {status === "success" && <Button onClick={() => setEditingService({})}>+ Nuevo servicio</Button>}
      </div>

      {status === "empty" && (
        <EmptyState
          title="Todavía no hay servicios"
          description="Crea el primero (ej. WiFi, Estacionamiento) para empezar."
          action={<Button onClick={() => setEditingService({})}>+ Nuevo servicio</Button>}
        />
      )}

      {status === "success" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Ícono</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <ServiceIcon icon={service.icon} className="h-5 w-5 text-[var(--color-primary)]" />
                  </td>
                  <td className="px-4 py-3 font-medium">{service.name}</td>
                  <td className="px-4 py-3">
                    <Badge className={TYPE_BADGE_STYLES[service.type]}>{SERVICE_TYPE_LABELS[service.type]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {service.active ? (
                      <Badge className="bg-emerald-100 text-emerald-800">Activo</Badge>
                    ) : (
                      <Badge className="bg-slate-200 text-slate-600">Inactivo</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setEditingService(service)}>
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeletingService(service)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={Boolean(editingService)}
        onClose={() => setEditingService(null)}
        title={editingService?.id ? "Editar servicio" : "Nuevo servicio"}
      >
        {formError && <ErrorMessage message={formError} className="mb-4" />}
        {editingService && (
          <ServiceForm
            initialValues={editingService.id ? editingService : null}
            onSubmit={handleSave}
            onCancel={() => setEditingService(null)}
            isSubmitting={isSaving}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingService)}
        onClose={() => setDeletingService(null)}
        onConfirm={handleDelete}
        title="Eliminar servicio"
        description={
          deleteError ||
          `¿Eliminar "${deletingService?.name}"? Esta acción no se puede deshacer y lo quita de cualquier habitación que lo tenga asignado.`
        }
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

function ServiceForm({ initialValues, onSubmit, onCancel, isSubmitting }) {
  const isEditing = Boolean(initialValues?.id);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [type, setType] = useState(initialValues?.type ?? SERVICE_TYPE.HOTEL);
  const [active, setActive] = useState(initialValues?.active ?? true);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setError(null);
    try {
      await onSubmit({ name: name.trim(), type, active });
    } catch {
      // El error ya queda reflejado por el estado de formError del padre.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="service-name" label="Nombre" value={name} onChange={(e) => setName(e.target.value)} error={error} required />

      <fieldset className="rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">Tipo</legend>
        <div className="flex flex-wrap gap-5">
          {Object.values(SERVICE_TYPE).map((value) => (
            <label key={value} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" name="service-type" value={value} checked={type === value} onChange={() => setType(value)} />
              {SERVICE_TYPE_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Activo
      </label>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Guardar cambios" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
