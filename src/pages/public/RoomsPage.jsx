import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AvailabilitySearch } from "../../components/public/AvailabilitySearch";
import { RoomCard } from "../../components/public/RoomCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { EmptyState } from "../../components/common/EmptyState";
import { useAvailability } from "../../hooks/useAvailability";
import { useRooms } from "../../hooks/useRooms";

export function RoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const availability = useAvailability();
  const allRooms = useRooms();

  const initialCriteria = useMemo(() => {
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = searchParams.get("guests");
    if (!checkIn || !checkOut || !guests) return null;
    return { checkInDate: checkIn, checkOutDate: checkOut, guestCount: Number(guests) };
  }, [searchParams]);

  useEffect(() => {
    if (initialCriteria) availability.search(initialCriteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCriteria]);

  function handleSearch(criteria) {
    setSearchParams({
      checkIn: criteria.checkInDate,
      checkOut: criteria.checkOutDate,
      guests: String(criteria.guestCount),
    });
    availability.search(criteria);
  }

  const isSearchMode = Boolean(initialCriteria);
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
                reservationHref={
                  isSearchMode
                    ? `/habitaciones/${roomType.slug}/reservar?checkIn=${initialCriteria.checkInDate}&checkOut=${initialCriteria.checkOutDate}&guests=${initialCriteria.guestCount}`
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
