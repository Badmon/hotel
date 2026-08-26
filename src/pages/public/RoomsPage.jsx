import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AvailabilitySearch } from "../../components/public/AvailabilitySearch";
import { RoomCard } from "../../components/public/RoomCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { EmptyState } from "../../components/common/EmptyState";
import { useAvailability } from "../../hooks/useAvailability";
import { useRooms } from "../../hooks/useRooms";
import { BOOKING_MODE } from "../../constants/bookingMode";

export function RoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const availability = useAvailability();
  const allRooms = useRooms();

  const initialCriteria = useMemo(() => {
    const mode = searchParams.get("mode") === BOOKING_MODE.HOURLY ? BOOKING_MODE.HOURLY : BOOKING_MODE.NIGHTLY;
    const guests = searchParams.get("guests");
    const checkIn = searchParams.get("checkIn");
    if (!checkIn || !guests) return null;

    if (mode === BOOKING_MODE.HOURLY) {
      const startTime = searchParams.get("startTime");
      const durationHours = searchParams.get("duration");
      if (!startTime || !durationHours) return null;
      return {
        bookingMode: BOOKING_MODE.HOURLY,
        checkInDate: checkIn,
        startTime,
        durationHours: Number(durationHours),
        guestCount: Number(guests),
      };
    }

    const checkOut = searchParams.get("checkOut");
    if (!checkOut) return null;
    return {
      bookingMode: BOOKING_MODE.NIGHTLY,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestCount: Number(guests),
    };
  }, [searchParams]);

  useEffect(() => {
    if (initialCriteria) availability.search(initialCriteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCriteria]);

  function handleSearch(criteria) {
    const params =
      criteria.bookingMode === BOOKING_MODE.HOURLY
        ? {
            mode: BOOKING_MODE.HOURLY,
            checkIn: criteria.checkInDate,
            startTime: criteria.startTime,
            duration: String(criteria.durationHours),
            guests: String(criteria.guestCount),
          }
        : {
            mode: BOOKING_MODE.NIGHTLY,
            checkIn: criteria.checkInDate,
            checkOut: criteria.checkOutDate,
            guests: String(criteria.guestCount),
          };

    setSearchParams(params);
    availability.search(criteria);
  }

  const isSearchMode = Boolean(initialCriteria);
  const bookingMode = initialCriteria?.bookingMode ?? BOOKING_MODE.NIGHTLY;
  const roomsToRender = isSearchMode ? availability.results : allRooms.roomTypes;
  const isLoading = isSearchMode ? availability.status === "loading" : allRooms.status === "loading";
  const hasError = isSearchMode ? availability.status === "error" : allRooms.status === "error";
  const isEmpty = isSearchMode ? availability.status === "empty" : allRooms.status === "empty";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Habitaciones</h1>
      <p className="mt-2 text-slate-600">
        Elige tus fechas para ver solamente las habitaciones disponibles, o explora todas nuestras opciones.
      </p>

      <div className="mt-6">
        <AvailabilitySearch initialValues={initialCriteria} onSubmit={handleSearch} isLoading={availability.status === "loading"} />
      </div>

      <div className="mt-10">
        {isLoading && <LoadingSpinner label="Buscando habitaciones..." />}
        {hasError && <ErrorMessage message={availability.error || "No fue posible cargar las habitaciones."} />}
        {isEmpty && (
          <EmptyState
            title="No hay habitaciones disponibles para esas fechas"
            description="Prueba con otras fechas o reduce la cantidad de huéspedes."
          />
        )}
        {!isLoading && !hasError && !isEmpty && roomsToRender?.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roomsToRender.map((roomType) => (
              <RoomCard
                key={roomType.id}
                roomType={roomType}
                bookingMode={bookingMode}
                reservationHref={
                  isSearchMode
                    ? `/habitaciones/${roomType.slug}/reservar?${searchParams.toString()}`
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
