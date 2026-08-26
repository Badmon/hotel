import { useCallback, useEffect, useState } from "react";
import { fetchAllRooms, updateRoomStatus } from "../../services/roomsService";
import { ROOM_STATUS, ROOM_STATUS_BADGE_STYLES, ROOM_STATUS_LABELS } from "../../constants/roomStatus";
import { Badge } from "../../components/common/Badge";
import { Select } from "../../components/common/Select";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";

const STATUS_OPTIONS = Object.values(ROOM_STATUS).map((status) => ({
  value: status,
  label: ROOM_STATUS_LABELS[status],
}));

export function RoomsAdminPage() {
  const [rooms, setRooms] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [updatingRoomId, setUpdatingRoomId] = useState(null);

  const load = useCallback(() => {
    setStatus("loading");
    fetchAllRooms()
      .then((data) => {
        setRooms(data);
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

  if (status === "loading") return <LoadingSpinner label="Cargando habitaciones..." />;
  if (status === "error") return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Número</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Piso</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Cambiar estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rooms.map((room) => (
            <tr key={room.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{room.room_number}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
