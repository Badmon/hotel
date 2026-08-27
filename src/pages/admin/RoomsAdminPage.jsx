import { useCallback, useEffect, useState } from "react";
import {
  fetchAllRooms,
  updateRoomStatus,
  createRoom,
  deleteRoom,
  fetchAllRoomTypesForAdmin,
} from "../../services/roomsService";
import { ROOM_STATUS, ROOM_STATUS_BADGE_STYLES, ROOM_STATUS_LABELS } from "../../constants/roomStatus";
import { Badge } from "../../components/common/Badge";
import { CopyableId } from "../../components/common/CopyableId";
import { Select } from "../../components/common/Select";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";

const STATUS_OPTIONS = Object.values(ROOM_STATUS).map((status) => ({
  value: status,
  label: ROOM_STATUS_LABELS[status],
}));

export function RoomsAdminPage() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [updatingRoomId, setUpdatingRoomId] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(() => {
    setStatus("loading");
    Promise.all([fetchAllRooms(), fetchAllRoomTypesForAdmin()])
      .then(([roomsData, roomTypesData]) => {
        setRooms(roomsData);
        setRoomTypes(roomTypesData);
        setStatus("success");
      })
      .catch(() => {
        setError("No fue posible cargar las habitaciones.");
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(roomId, newStatus) {
    setUpdatingRoomId(roomId);
    try {
      await updateRoomStatus(roomId, newStatus);
      setRooms((current) =>
        current.map((room) => (room.id === roomId ? { ...room, status: newStatus } : room))
      );
    } catch {
      setError("No fue posible actualizar el estado de la habitación.");
    } finally {
      setUpdatingRoomId(null);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteRoom(deletingRoom.id);
      setDeletingRoom(null);
      load();
    } catch (err) {
      setDeleteError(err.message || "No fue posible eliminar esta habitación.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (status === "loading") return <LoadingSpinner label="Cargando habitaciones..." />;
  if (status === "error") return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)}>+ Nueva habitación</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Piso</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Cambiar estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{room.room_number}</td>
                <td className="px-4 py-3">
                  <CopyableId id={room.id} />
                </td>
                <td className="px-4 py-3">{room.room_types?.name ?? "—"}</td>
                <td className="px-4 py-3">{room.floor ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge className={ROOM_STATUS_BADGE_STYLES[room.status]}>
                    {ROOM_STATUS_LABELS[room.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Select
                    id={`room-status-${room.id}`}
                    options={STATUS_OPTIONS}
                    value={room.status}
                    disabled={updatingRoomId === room.id}
                    onChange={(e) => handleStatusChange(room.id, e.target.value)}
                    className="w-40"
                  />
                </td>
                <td className="px-4 py-3">
                  <Button variant="danger" size="sm" onClick={() => setDeletingRoom(room)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nueva habitación">
        <CreateRoomForm
          roomTypes={roomTypes}
          onCancel={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false);
            load();
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingRoom)}
        onClose={() => setDeletingRoom(null)}
        onConfirm={handleDelete}
        title="Eliminar habitación"
        description={
          deleteError ||
          `¿Eliminar la habitación "${deletingRoom?.room_number}"? Si tiene reservas asociadas (incluso antiguas), no se podrá eliminar — desactívala marcándola como "Deshabilitada" en su lugar.`
        }
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

function CreateRoomForm({ roomTypes, onCancel, onCreated }) {
  const [roomNumber, setRoomNumber] = useState("");
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id ?? "");
  const [floor, setFloor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!roomNumber.trim() || !roomTypeId) {
      setError("Completa el número y el tipo de habitación.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createRoom({ roomNumber: roomNumber.trim(), roomTypeId: Number(roomTypeId), floor: floor.trim() });
      onCreated();
    } catch (err) {
      setError(
        err.message?.includes("duplicate key")
          ? "Ya existe una habitación con ese número."
          : err.message || "No fue posible crear la habitación."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (roomTypes.length === 0) {
    return <ErrorMessage message="Primero crea un tipo de habitación en 'Tipos de habitación'." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="room-number" label="Número" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
      <Select
        id="room-type"
        label="Tipo de habitación"
        value={roomTypeId}
        onChange={(e) => setRoomTypeId(e.target.value)}
        options={roomTypes.map((type) => ({ value: type.id, label: type.name }))}
      />
      <Input id="room-floor" label="Piso (opcional)" value={floor} onChange={(e) => setFloor(e.target.value)} />
      {error && <ErrorMessage message={error} />}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Crear
        </Button>
      </div>
    </form>
  );
}
