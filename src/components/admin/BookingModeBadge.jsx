import { Badge } from "../common/Badge";
import { BOOKING_MODE, BOOKING_MODE_LABELS } from "../../constants/bookingMode";

const STYLES = {
  [BOOKING_MODE.NIGHTLY]: "bg-slate-100 text-slate-700",
  [BOOKING_MODE.HOURLY]: "bg-violet-100 text-violet-800",
};

export function BookingModeBadge({ bookingMode }) {
  return (
    <Badge className={STYLES[bookingMode] ?? STYLES[BOOKING_MODE.NIGHTLY]}>
      {BOOKING_MODE_LABELS[bookingMode] ?? BOOKING_MODE_LABELS[BOOKING_MODE.NIGHTLY]}
    </Badge>
  );
}
