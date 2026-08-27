import { useNavigate } from "react-router-dom";
import { MainBanner } from "../../components/public/MainBanner";
import { AvailabilitySearch } from "../../components/public/AvailabilitySearch";
import { RoomCard } from "../../components/public/RoomCard";
import { HourlyRoomCard } from "../../components/public/HourlyRoomCard";
import { PromotionRoomCard } from "../../components/public/PromotionRoomCard";
import { ServicesList } from "../../components/public/ServicesList";
import { LocationSection } from "../../components/public/LocationSection";
import { ContactSection } from "../../components/public/ContactSection";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { useRooms } from "../../hooks/useRooms";
import { siteConfig } from "../../config/siteConfig";
import { BOOKING_MODE } from "../../constants/bookingMode";
import { isPromotionActive } from "../../utils/promotions";

export function HomePage() {
  const navigate = useNavigate();
  const { roomTypes, status, error } = useRooms();

  const nightlyRoomTypes = roomTypes.filter((room) => !room.allows_hourly);
  const featuredRoomTypes = nightlyRoomTypes.filter((room) => room.featured).slice(0, 3);
  const nightlyRoomsToShow = featuredRoomTypes.length > 0 ? featuredRoomTypes : nightlyRoomTypes.slice(0, 3);
  const hourlyRoomsToShow = roomTypes.filter((room) => room.allows_hourly).slice(0, 3);
  const promotedRoomsToShow = roomTypes.filter(isPromotionActive).slice(0, 3);

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

    navigate(`/habitaciones?${new URLSearchParams(params).toString()}`);
  }

  return (
    <>
      <MainBanner />

      <section id="buscar-disponibilidad" className="mx-auto -mt-2 max-w-5xl px-4">
        <AvailabilitySearch onSubmit={handleSearch} />
      </section>

      {status === "success" && promotedRoomsToShow.length > 0 && (
        <section className="bg-amber-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Promociones</h2>
              <p className="mt-2 text-slate-600">Ofertas por tiempo limitado en habitaciones seleccionadas.</p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {promotedRoomsToShow.map((roomType) => (
                <PromotionRoomCard key={roomType.id} roomType={roomType} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Habitaciones</h2>
          <p className="mt-2 text-slate-600">Conoce algunas de nuestras opciones para tu estadía.</p>
        </div>

        <div className="mt-8">
          {status === "loading" && <LoadingSpinner label="Cargando habitaciones..." />}
          {status === "error" && <ErrorMessage message={error} />}
          {status === "success" && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nightlyRoomsToShow.map((roomType) => (
                <RoomCard key={roomType.id} roomType={roomType} />
              ))}
            </div>
          )}
        </div>
      </section>

      {status === "success" && hourlyRoomsToShow.length > 0 && (
        <section className="bg-violet-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Reserva por horas</h2>
              <p className="mt-2 text-slate-600">
                ¿Solo necesitas la habitación unas horas? Resérvala directamente, sin quedarte toda la noche.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hourlyRoomsToShow.map((roomType) => (
                <HourlyRoomCard key={roomType.id} roomType={roomType} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ServicesList />
      <LocationSection />
      <ContactSection />

      <p className="sr-only">{siteConfig.hotel.description}</p>
    </>
  );
}
