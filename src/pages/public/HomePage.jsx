import { Link } from "react-router-dom";
import { MainBanner } from "../../components/public/MainBanner";
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
import { isPromotionActive } from "../../utils/promotions";

export function HomePage() {
  const { roomTypes, status, error } = useRooms();

  const nightlyRoomTypes = roomTypes.filter((room) => !room.allows_hourly);
  const nightlyRoomsToShow = nightlyRoomTypes.slice(0, 3);
  const hourlyRoomTypes = roomTypes.filter((room) => room.allows_hourly);
  const hourlyRoomsToShow = hourlyRoomTypes.slice(0, 3);
  const promotedRoomTypes = roomTypes.filter(isPromotionActive);
  const promotedRoomsToShow = promotedRoomTypes.slice(0, 3);

  return (
    <>
      <MainBanner />

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
              {promotedRoomTypes.length >= 4 && <ExploreMoreCard count={promotedRoomTypes.length} mode="promotion" />}
            </div>
          </div>
        </section>
      )}

      <section className="bg-teal-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Habitaciones</h2>
            <p className="mt-2 text-slate-600">
              {nightlyRoomTypes.length} {nightlyRoomTypes.length === 1 ? "opción disponible" : "opciones disponibles"} para tu estadía.
            </p>
          </div>

          <div className="mt-8">
            {status === "loading" && <LoadingSpinner label="Cargando habitaciones..." />}
            {status === "error" && <ErrorMessage message={error} />}
            {status === "success" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {nightlyRoomsToShow.map((roomType) => (
                  <RoomCard key={roomType.id} roomType={roomType} />
                ))}
                {nightlyRoomTypes.length >= 4 && (
                  <ExploreMoreCard count={nightlyRoomTypes.length} mode="nightly" />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {status === "success" && hourlyRoomsToShow.length > 0 && (
        <section className="bg-violet-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Reserva por horas</h2>
              <p className="mt-2 text-slate-600">
                {hourlyRoomTypes.length} {hourlyRoomTypes.length === 1 ? "opción disponible" : "opciones disponibles"} para reservar sin quedarte toda la noche.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hourlyRoomsToShow.map((roomType) => (
                <HourlyRoomCard key={roomType.id} roomType={roomType} />
              ))}
              {hourlyRoomTypes.length >= 4 && (
                <ExploreMoreCard count={hourlyRoomTypes.length} mode="hourly" />
              )}
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

function ExploreMoreCard({ count, mode }) {
  const isHourly = mode === "hourly";
  const isPromotion = mode === "promotion";
  const label = isHourly ? "por horas" : isPromotion ? "en promoción" : "por noche";

  return (
    <Link
      to={`/habitaciones?modalidad=${mode}`}
      className={`group flex items-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 lg:col-span-3 ${
        isHourly
          ? "border-violet-300 bg-violet-100/60 hover:border-violet-500"
          : isPromotion
            ? "border-amber-300 bg-amber-100/60 hover:border-amber-500"
          : "border-sky-300 bg-sky-50 hover:border-sky-500"
      }`}
    >
      <span className={`text-xs font-semibold ${isHourly ? "text-violet-700" : isPromotion ? "text-amber-700" : "text-sky-700"}`}>Más opciones:</span>
      <span className="text-sm font-bold text-slate-900 sm:text-base">
        Ver las {count} habitaciones {label}
        <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
