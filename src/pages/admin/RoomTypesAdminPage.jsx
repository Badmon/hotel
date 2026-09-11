import { useCallback, useEffect, useState } from "react";
import {
  fetchAllRoomTypesForAdmin,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} from "../../services/roomsService";
import { RoomTypeForm } from "../../components/admin/RoomTypeForm";
import { Modal } from "../../components/common/Modal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { CopyableId } from "../../components/common/CopyableId";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { EmptyState } from "../../components/common/EmptyState";
import { formatCurrency, getRoomRateUnitLabel } from "../../utils/currency";
import { isPromotionActive } from "../../utils/promotions";
import { siteConfig } from "../../config/siteConfig";

export function RoomTypesAdminPage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [editingRoomType, setEditingRoomType] = useState(null); // null = cerrado, {} = nuevo, {...} = editar
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deletingRoomType, setDeletingRoomType] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const load = useCallback(() => {
    setStatus("loading");
    fetchAllRoomTypesForAdmin()
      .then((data) => {
        setRoomTypes(data);
        setStatus(data.length === 0 ? "empty" : "success");
      })
      .catch(() => {
        setError("No fue posible cargar los tipos de habitación.");
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(roomType, images) {
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingRoomType?.id) {
        await updateRoomType(editingRoomType.id, roomType, images);
      } else {
        await createRoomType(roomType, images);
      }
      setEditingRoomType(null);
      load();
    } catch (err) {
      setFormError(
        err.message?.includes("duplicate key")
          ? "Ya existe un tipo de habitación con ese slug. Usa uno distinto."
          : err.message || "No fue posible guardar los cambios."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteRoomType(deletingRoomType.id);
      setDeletingRoomType(null);
      load();
    } catch (err) {
      setDeleteError(err.message || "No fue posible eliminar este tipo de habitación.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (status === "loading") return <LoadingSpinner label="Cargando tipos de habitación..." />;
  if (status === "error") return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Estas tarjetas son las mismas que ven los huéspedes en la web pública.
        </p>
        {status === "success" && (
          <Button onClick={() => setEditingRoomType({})}>+ Nuevo tipo de habitación</Button>
        )}
      </div>

      {status === "empty" && (
        <EmptyState
          title="Todavía no hay tipos de habitación"
          description="Crea el primero para empezar a recibir reservas."
          action={<Button onClick={() => setEditingRoomType({})}>+ Nuevo tipo de habitación</Button>}
        />
      )}

      {status === "success" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roomTypes.map((roomType) => (
            <div key={roomType.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img
                src={roomType.room_images?.[0]?.image_url || siteConfig.images.placeholderRoom}
                alt={roomType.room_images?.[0]?.alt_text || roomType.name}
                className="h-40 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{roomType.name}</h3>
                  {!roomType.active && <Badge className="bg-slate-200 text-slate-600">Inactiva</Badge>}
                  <Badge className={roomType.allows_hourly ? "bg-violet-100 text-violet-800" : "bg-sky-100 text-sky-800"}>
                    {roomType.allows_hourly ? "Por horas" : "Por noches"}
                  </Badge>
                  {roomType.on_promotion && (
                    <Badge className={isPromotionActive(roomType) ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}>
                      {isPromotionActive(roomType) ? "Promoción vigente" : "Promoción programada"}
                    </Badge>
                  )}
                </div>
                <CopyableId id={roomType.id} className="mt-1" />
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-600">{roomType.short_description}</p>
                <div className="mt-3 text-sm text-slate-500">
                  <p>Hasta {roomType.capacity} huéspedes</p>
                  {roomType.on_promotion ? (
                    <p>
                      <span className="mr-2 line-through">{formatCurrency(roomType.allows_hourly ? roomType.hourly_price : roomType.base_price)}</span>
                      <span className="font-semibold text-emerald-700">
                        {formatCurrency(roomType.promo_price)} x {getRoomRateUnitLabel(roomType)}
                      </span>
                    </p>
                  ) : !roomType.allows_hourly ? (
                    <p className="font-semibold text-slate-900">{formatCurrency(roomType.base_price)} x {getRoomRateUnitLabel(roomType)}</p>
                  ) : null}
                  {roomType.allows_hourly && !roomType.on_promotion && (
                    <p className="font-semibold text-violet-700">
                      {formatCurrency(roomType.hourly_price)} x {getRoomRateUnitLabel(roomType)}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditingRoomType(roomType)}>
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1" onClick={() => setDeletingRoomType(roomType)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(editingRoomType)}
        onClose={() => setEditingRoomType(null)}
        title={editingRoomType?.id ? "Editar tipo de habitación" : "Nuevo tipo de habitación"}
        size="lg"
      >
        {formError && <ErrorMessage message={formError} className="mb-4" />}
        {editingRoomType && (
          <RoomTypeForm
            initialValues={editingRoomType.id ? editingRoomType : null}
            onSubmit={handleSave}
            onCancel={() => setEditingRoomType(null)}
            isSubmitting={isSaving}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingRoomType)}
        onClose={() => setDeletingRoomType(null)}
        onConfirm={handleDelete}
        title="Eliminar tipo de habitación"
        description={
          deleteError ||
          `¿Eliminar "${deletingRoomType?.name}"? Esta acción no se puede deshacer. Si tiene habitaciones físicas o reservas asociadas, no se podrá eliminar.`
        }
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
