import { useNavigate } from "react-router-dom";
import { Hero } from "../../components/public/Hero";
import { AvailabilitySearch } from "../../components/public/AvailabilitySearch";
import { RoomCard } from "../../components/public/RoomCard";
import { ServicesList } from "../../components/public/ServicesList";
import { LocationSection } from "../../components/public/LocationSection";
import { ContactSection } from "../../components/public/ContactSection";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { useRooms } from "../../hooks/useRooms";
import { siteConfig } from "../../config/siteConfig";

export function HomePage() {
  const navigate = useNavigate();
  const { roomTypes, status, error } = useRooms();
  const featuredRoomTypes = roomTypes.filter((room) => room.featured).slice(0, 3);
  const roomsToShow = featuredRoomTypes.length > 0 ? featuredRoomTypes : roomTypes.slice(0, 3);

  function handleSearch(criteria) {
    const params = new URLSearchParams({
      checkIn: criteria.checkInDate,
      checkOut: criteria.checkOutDate,
      guests: String(criteria.guestCount),
    });
    navigate(`/habitaciones?${params.toString()}`);
  }

  return (
    <>
      <Hero />

      <section id="buscar-disponibilidad" className="mx-auto -mt-12 max-w-5xl px-4">
        <AvailabilitySearch onSubmit={handleSearch} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Habitaciones</h2>
            <p className="mt-2 text-slate-600">Conoce algunas de nuestras opciones.</p>
          </div>
        </div>

        <div className="mt-8">
          {status === "loading" && <LoadingSpinner label="Cargando habitaciones..." />}
          {status === "error" && <ErrorMessage message={error} />}
          {status === "success" && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roomsToShow.map((roomType) => (
                <RoomCard key={roomType.id} roomType={roomType} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ServicesList />
      <LocationSection />
      <ContactSection />

      <p className="sr-only">{siteConfig.hotel.description}</p>
    </>
  );
}
