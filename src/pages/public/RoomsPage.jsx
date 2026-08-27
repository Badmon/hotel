import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AvailabilitySearch } from "../../components/public/AvailabilitySearch";
import { RoomCard } from "../../components/public/RoomCard";
import { HourlyRoomCard } from "../../components/public/HourlyRoomCard";
import { PromotionRoomCard } from "../../components/public/PromotionRoomCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { EmptyState } from "../../components/common/EmptyState";
import { useAvailability } from "../../hooks/useAvailability";
import { useRooms } from "../../hooks/useRooms";
import { BOOKING_MODE } from "../../constants/bookingMode";
import { isPromotionActive } from "../../utils/promotions";

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
      if (!startTime) return null;
      return {
        bookingMode: BOOKING_MODE.HOURLY,
        checkInDate: checkIn,
        startTime,
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
  const catalogMode = ["hourly", "nightly", "promotion"].includes(searchParams.get("modalidad"))
    ? searchParams.get("modalidad")
    : null;
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
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        {catalogMode === "hourly" ? "Habitaciones por horas" : catalogMode === "nightly" ? "Habitaciones por noche" : catalogMode === "promotion" ? "Habitaciones en promoción" : "Habitaciones"}
      </h1>
      <p className="mt-2 text-slate-600">
        {catalogMode
          ? "Explora todas las opciones disponibles en esta modalidad."
          : "Elige tus fechas para ver solamente las habitaciones disponibles, o explora todas nuestras opciones."}
      </p>

      {!catalogMode && (
        <div className="mt-6">
          <AvailabilitySearch initialValues={initialCriteria} onSubmit={handleSearch} isLoading={availability.status === "loading"} />
        </div>
      )}

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
                  reservationHref={`/habitaciones/${roomType.id}/reservar?${searchParams.toString()}`}
                />
              ) : (
                <RoomCard
                  key={roomType.id}
                  roomType={roomType}
                  reservationHref={`/habitaciones/${roomType.id}/reservar?${searchParams.toString()}`}
                />
              )
            )}
          </div>
        )}

        {/* Sin búsqueda activa: catálogo completo, separado por modalidad. */}
        {!isLoading && !hasError && !isSearchMode && (
          <RoomsCatalog roomTypes={allRooms.roomTypes} mode={catalogMode} />
        )}
      </div>
    </div>
  );
}

function RoomsCatalog({ roomTypes, mode }) {
  const filteredRoomTypes = mode === "hourly"
    ? roomTypes.filter((room) => room.allows_hourly)
    : mode === "nightly"
      ? roomTypes.filter((room) => !room.allows_hourly)
      : mode === "promotion"
        ? roomTypes.filter(isPromotionActive)
        : roomTypes;
  const hourlyRoomTypes = filteredRoomTypes.filter((room) => room.allows_hourly);
  const nightlyRoomTypes = filteredRoomTypes.filter((room) => !room.allows_hourly);
  const promotedRoomTypes = filteredRoomTypes.filter(isPromotionActive);

  if (filteredRoomTypes.length === 0) {
    return <EmptyState title={`Todavía no hay habitaciones ${mode === "hourly" ? "por horas" : mode === "promotion" ? "en promoción" : "por noche"} publicadas`} />;
  }

  return (
    <div className="space-y-14">
      {mode === "promotion" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promotedRoomTypes.map((roomType) => (
            <PromotionRoomCard key={roomType.id} roomType={roomType} />
          ))}
        </div>
      )}

      {mode === null && promotedRoomTypes.length > 0 && (
        <div className="rounded-2xl bg-amber-50 p-5 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Promociones</h2>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {promotedRoomTypes.map((roomType) => (
              <PromotionRoomCard key={roomType.id} roomType={roomType} />
            ))}
          </div>
        </div>
      )}

      {mode !== "promotion" && nightlyRoomTypes.length > 0 && <div>
        <h2 className="text-xl font-semibold text-slate-900">Por noche</h2>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {nightlyRoomTypes.map((roomType) => (
            <RoomCard key={roomType.id} roomType={roomType} />
          ))}
        </div>
      </div>}

      {mode !== "promotion" && hourlyRoomTypes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Por horas</h2>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hourlyRoomTypes.map((roomType) => (
              <HourlyRoomCard key={roomType.id} roomType={roomType} />
            ))}
          </div>
        </div>
      )}

      {mode && (
        <Link to="/habitaciones" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
          ← Ver todas las habitaciones
        </Link>
      )}
    </div>
  );
}
