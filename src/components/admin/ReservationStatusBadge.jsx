import { Badge } from "../common/Badge";
import { RESERVATION_STATUS_BADGE_STYLES, getReservationStatusLabel } from "../../constants/reservationStatus";

export function ReservationStatusBadge({ status }) {
  return (
    <Badge className={RESERVATION_STATUS_BADGE_STYLES[status] ?? "bg-slate-100 text-slate-700"}>
      {getReservationStatusLabel(status)}
    </Badge>
  );
}
