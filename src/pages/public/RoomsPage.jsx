import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AvailabilitySearch } from "../../components/public/AvailabilitySearch";
import { RoomCard } from "../../components/public/RoomCard";
import { HourlyRoomCard } from "../../components/public/HourlyRoomCard";
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
  const isHourlySearch = isSearchMode && bookingMode === BOOKING_MODE.HOURLY;

  // "idle" cuenta como cargando cuando hay criterios en la URL: el
  // useEffect todavía no disparó la búsqueda en el primer render, y
  // availability.results sigue siendo null en ese instante.
  const isLoading = isSearchMode
    ? availability.status === "loading" || availability.status === "idle"
    : allRooms.status === "loading";
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
            title="No hay habitaciones disponibles para ese horario"
            description="Prueba con otra fecha, hora o reduce la cantidad de huéspedes."
          />
        )}

        {!isLoading && !hasError && !isEmpty && isSearchMode && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(availability.results ?? []).map((roomType) =>
              isHourlySearch ? (
                <HourlyRoomCard
                  key={roomType.id}
                  roomType={roomType}
                  reservationHref={`/habitaciones/${roomType.slug}/reservar?${searchParams.toString()}`}
                />
              ) : (
                <RoomCard
                  key={roomType.id}
                  roomType={roomType}
                  reservationHref={`/habitaciones/${roomType.slug}/reservar?${searchParams.toString()}`}
                />
              )
            )}
          </div>
        )}

        {/* Sin búsqueda activa: catálogo completo, separado por modalidad. */}
        {!isLoading && !hasError && !isSearchMode && (
          <RoomsCatalog roomTypes={allRooms.roomTypes} />
        )}
      </div>
    </div>
  );
}

function RoomsCatalog({ roomTypes }) {
  const hourlyRoomTypes = roomTypes.filter((room) => room.allows_hourly);

  if (roomTypes.length === 0) {
    return <EmptyState title="Todavía no hay habitaciones publicadas" />;
  }

  return (
    <div className="space-y-14">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Por noche</h2>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roomTypes.map((roomType) => (
            <RoomCard key={roomType.id} roomType={roomType} />
          ))}
        </div>
      </div>

      {hourlyRoomTypes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Por horas</h2>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hourlyRoomTypes.map((roomType) => (
              <HourlyRoomCard key={roomType.id} roomType={roomType} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
