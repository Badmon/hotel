import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchRoomTypeById } from "../../services/roomsService";
import { siteConfig } from "../../config/siteConfig";
import { formatCurrency } from "../../utils/currency";
import { isPromotionActive } from "../../utils/promotions";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "../../components/common/Button";

export function RoomDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [roomType, setRoomType] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");

    fetchRoomTypeById(id)
      .then((data) => {
        if (!isMounted) return;
        setRoomType(data);
        setStatus(data ? "success" : "empty");
      })
      .catch(() => {
        if (isMounted) setStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (status === "loading") return <LoadingSpinner label="Cargando habitación..." className="min-h-[50vh]" />;
  if (status === "error") return <ErrorMessage message="No fue posible cargar esta habitación." className="mx-auto max-w-2xl my-16" />;
  if (status === "empty") {
    return (
      <EmptyState
        title="Habitación no encontrada"
        description="Puede que ya no esté disponible."
        action={<Link to="/habitaciones" className="text-sm font-medium text-[var(--color-primary)]">Ver todas las habitaciones</Link>}
        className="mx-auto max-w-2xl my-16"
      />
    );
  }

  const images = roomType.room_images.length > 0 ? roomType.room_images : [{ image_url: siteConfig.images.placeholderRoom, alt_text: roomType.name }];
  const reserveQuery = searchParams.toString();
  const onPromotion = isPromotionActive(roomType);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <img
          src={images[0].image_url}
          alt={images[0].alt_text || roomType.name}
          className="col-span-4 h-72 w-full rounded-xl object-cover sm:col-span-3 sm:h-96"
        />
        <div className="hidden grid-cols-1 gap-3 sm:col-span-1 sm:grid">
          {images.slice(1, 4).map((image) => (
            <img
              key={image.id ?? image.image_url}
              src={image.image_url}
              alt={image.alt_text || roomType.name}
              className="h-[7.5rem] w-full rounded-xl object-cover"
            />
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{roomType.name}</h1>
          <p className="mt-2 text-slate-600">Hasta {roomType.capacity} huéspedes</p>
          <p className="mt-4 whitespace-pre-line text-slate-700">{roomType.description || roomType.short_description}</p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Servicios del hotel</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600 sm:grid-cols-3">
            {siteConfig.services.map((service) => (
              <li key={service.id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                {service.label}
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 p-5 shadow-sm">
          {onPromotion && (
            <span className="mb-2 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              Oferta por tiempo limitado
            </span>
          )}
          <p className="text-sm text-slate-500">Precio referencial</p>
          {onPromotion ? (
            <p className="flex items-baseline gap-2">
              <span className="text-base text-slate-400 line-through">{formatCurrency(roomType.allows_hourly ? roomType.hourly_price : roomType.base_price)}</span>
              <span className="text-2xl font-bold text-amber-700">{formatCurrency(roomType.promo_price)}</span>
              <span className="text-sm font-normal text-slate-500">
                {roomType.allows_hourly
                  ? `/ ${roomType.hourly_duration_hours} ${roomType.hourly_duration_hours === 1 ? "hora" : "horas"}`
                  : "/ noche"}
              </span>
            </p>
          ) : !roomType.allows_hourly ? (
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(roomType.base_price)} <span className="text-sm font-normal text-slate-500">/ noche</span>
            </p>
          ) : null}
          {roomType.allows_hourly && (
            <p className="mt-1 text-base font-semibold text-slate-700">
              {formatCurrency(roomType.hourly_price)}{" "}
              <span className="text-sm font-normal text-slate-500">
                por {roomType.hourly_duration_hours} {roomType.hourly_duration_hours === 1 ? "hora" : "horas"}
              </span>
            </p>
          )}
          <Link to={`/habitaciones/${roomType.id}/reservar${reserveQuery ? `?${reserveQuery}` : ""}`}>
            <Button className="mt-4 w-full">Reservar</Button>
          </Link>
          <p className="mt-3 text-xs text-slate-500">
            El pago se realiza directamente en el hotel. No se realiza ningún cobro en línea.
          </p>
        </aside>
      </div>
    </div>
  );
}
