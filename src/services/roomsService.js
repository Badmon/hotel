import { supabase } from "../lib/supabaseClient";
import { replaceRoomTypeServices } from "./servicesService";

/**
 * Capa de acceso a datos de tipos de habitación, habitaciones e
 * imágenes. Los componentes no deben llamar a `supabase` directamente:
 * pasan siempre por estas funciones.
 */

const ROOM_TYPE_COLUMNS = `id, name, slug, short_description, description, capacity, base_price,
  allows_hourly, hourly_price, hourly_duration_hours, active,
  on_promotion, promo_price, promo_starts_at, promo_ends_at`;

const ROOM_TYPE_SERVICES_EMBED = `room_type_services ( services ( id, name, type, icon ) )`;

/** Aplana el embed anidado room_type_services -> services en un array plano de servicios. */
function flattenRoomTypeServices(roomType) {
  return (roomType.room_type_services ?? []).map((rts) => rts.services).filter(Boolean);
}

export async function fetchActiveRoomTypesWithImages() {
  const { data, error } = await supabase
    .from("room_types")
    .select(`${ROOM_TYPE_COLUMNS}, room_images ( id, image_url, alt_text, display_order ), ${ROOM_TYPE_SERVICES_EMBED}`)
    .eq("active", true)
    .order("base_price", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((roomType) => ({
    ...roomType,
    room_images: [...(roomType.room_images ?? [])].sort(
      (a, b) => a.display_order - b.display_order
    ),
    services: flattenRoomTypeServices(roomType),
  }));
}

export async function fetchRoomTypeById(id) {
  const { data, error } = await supabase
    .from("room_types")
    .select(`${ROOM_TYPE_COLUMNS}, room_images ( id, image_url, alt_text, display_order ), ${ROOM_TYPE_SERVICES_EMBED}`)
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    room_images: [...(data.room_images ?? [])].sort(
      (a, b) => a.display_order - b.display_order
    ),
    services: flattenRoomTypeServices(data),
  };
}

/**
 * Consulta tipos de habitación con disponibilidad vía la función SQL
 * `search_available_rooms`, que es SECURITY DEFINER: expone solamente
 * datos públicos, nunca reservas de otros huéspedes. Un tipo aparece en
 * el resultado si tiene al menos una habitación física disponible para
 * el rango de fechas indicado.
 *
 * La asignación de la habitación física concreta ocurre recién al
 * crear la reserva (ver reservationsService.createReservation), donde
 * se vuelve a validar disponibilidad de forma atómica en el servidor.
 */
export async function searchAvailableRoomTypes({ checkInDate, checkOutDate, guestCount }) {
  const { data, error } = await supabase.rpc("search_available_rooms", {
    p_check_in: checkInDate,
    p_check_out: checkOutDate,
    p_guests: guestCount,
  });

  if (error) throw error;
  return attachRoomImages(data ?? [], (type) => ({
    id: type.room_type_id,
    name: type.name,
    slug: type.slug,
    short_description: type.short_description,
    capacity: type.capacity,
    base_price: type.base_price,
  }));
}

/**
 * Equivalente a searchAvailableRoomTypes pero para reserva "por
 * horas": recibe solo el instante de inicio (ISO) — la duración ya no
 * la elige el huésped, es un paquete fijo por tipo de habitación
 * (hourly_duration_hours), así que el checkout lo calcula la propia
 * función SQL `search_available_rooms_hourly` para cada tipo. Solo
 * devuelve tipos con allows_hourly = true.
 */
export async function searchAvailableRoomTypesHourly({ checkInAt, guestCount }) {
  const { data, error } = await supabase.rpc("search_available_rooms_hourly", {
    p_check_in: checkInAt,
    p_guests: guestCount,
  });

  if (error) throw error;
  return attachRoomImages(data ?? [], (type) => ({
    id: type.room_type_id,
    name: type.name,
    slug: type.slug,
    short_description: type.short_description,
    capacity: type.capacity,
    hourly_price: type.hourly_price,
    hourly_duration_hours: type.hourly_duration_hours,
  }));
}

/** Adjunta las imágenes de cada tipo a los resultados de una búsqueda de disponibilidad. */
async function attachRoomImages(availableTypes, mapRoomType) {
  if (availableTypes.length === 0) return [];

  const typeIds = availableTypes.map((type) => type.room_type_id);
  const { data: images, error: imagesError } = await supabase
    .from("room_images")
    .select("id, room_type_id, image_url, alt_text, display_order")
    .in("room_type_id", typeIds)
    .order("display_order", { ascending: true });

  if (imagesError) throw imagesError;

  return availableTypes.map((type) => ({
    ...mapRoomType(type),
    room_images: (images ?? []).filter((image) => image.room_type_id === type.room_type_id),
  }));
}

/** Todas las habitaciones físicas (uso administrativo). */
export async function fetchAllRooms() {
  const { data, error } = await supabase
    .from("rooms")
    .select(`id, room_number, floor, status, notes, room_type_id, room_types ( id, name )`)
    .order("room_number", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function updateRoomStatus(roomId, status) {
  const { data, error } = await supabase
    .from("rooms")
    .update({ status })
    .eq("id", roomId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createRoom({ roomNumber, roomTypeId, floor }) {
  const { data, error } = await supabase
    .from("rooms")
    .insert({ room_number: roomNumber, room_type_id: roomTypeId, floor: floor || null })
    .select(`id, room_number, floor, status, notes, room_type_id, room_types ( id, name )`)
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoom(id, { roomNumber, roomTypeId, floor }) {
  const { data, error } = await supabase
    .from("rooms")
    .update({ room_number: roomNumber, room_type_id: roomTypeId, floor: floor || null })
    .eq("id", id)
    .select(`id, room_number, floor, status, notes, room_type_id, room_types ( id, name )`)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRoom(roomId) {
  const { error } = await supabase.from("rooms").delete().eq("id", roomId);
  if (error) throw translateDeleteError(error, "habitación");
}

/**
 * Todos los tipos de habitación para el panel administrativo, incluidos
 * los inactivos (a diferencia de fetchActiveRoomTypesWithImages, que
 * solo trae los visibles al público).
 */
export async function fetchAllRoomTypesForAdmin() {
  const { data, error } = await supabase
    .from("room_types")
    .select(`${ROOM_TYPE_COLUMNS}, room_images ( id, image_url, alt_text, display_order ), ${ROOM_TYPE_SERVICES_EMBED}`)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((roomType) => ({
    ...roomType,
    room_images: [...(roomType.room_images ?? [])].sort((a, b) => a.display_order - b.display_order),
    services: flattenRoomTypeServices(roomType),
  }));
}

export async function createRoomType(roomType, images, serviceIds = []) {
  const { data, error } = await supabase.from("room_types").insert(roomType).select().single();
  if (error) throw error;
  await replaceRoomImages(data.id, images);
  await replaceRoomTypeServices(data.id, serviceIds);
  return data;
}

export async function updateRoomType(id, roomType, images, serviceIds = []) {
  const { error } = await supabase.from("room_types").update(roomType).eq("id", id);
  if (error) throw error;
  await replaceRoomTypeServices(id, serviceIds);
  await replaceRoomImages(id, images);
}

export async function deleteRoomType(id) {
  const { data: images } = await supabase.from("room_images").select("image_url").eq("room_type_id", id);

  const { error } = await supabase.from("room_types").delete().eq("id", id);
  if (error) throw translateDeleteError(error, "tipo de habitación");

  await deleteRoomImageFiles((images ?? []).map((image) => image.image_url));
}

/**
 * Reemplaza por completo las imágenes de un tipo de habitación. Más
 * simple y suficiente para este panel que llevar un diff fila por
 * fila: la cantidad de imágenes por tipo siempre es pequeña.
 *
 * Antes de reemplazar, guarda las URLs anteriores para poder borrar
 * del bucket las que ya no queden referenciadas — evita acumular
 * archivos huérfanos cada vez que se reemplaza una foto.
 */
async function replaceRoomImages(roomTypeId, images) {
  const { data: existing } = await supabase.from("room_images").select("image_url").eq("room_type_id", roomTypeId);

  const { error: deleteError } = await supabase.from("room_images").delete().eq("room_type_id", roomTypeId);
  if (deleteError) throw deleteError;

  if (images && images.length > 0) {
    const rows = images.map((image, index) => ({
      room_type_id: roomTypeId,
      image_url: image.image_url,
      alt_text: image.alt_text || null,
      display_order: index,
    }));

    const { error: insertError } = await supabase.from("room_images").insert(rows);
    if (insertError) throw insertError;
  }

  const keptUrls = new Set((images ?? []).map((image) => image.image_url));
  const removedUrls = (existing ?? []).map((row) => row.image_url).filter((url) => !keptUrls.has(url));
  await deleteRoomImageFiles(removedUrls);
}

const ROOM_IMAGES_BUCKET = "room-images";
const ROOM_IMAGES_MAX_BYTES = 20 * 1024 * 1024;

/** Sube una foto al bucket de Storage y devuelve su URL pública, lista para guardar en image_url. */
export async function uploadRoomImage(file) {
  if (file.size > ROOM_IMAGES_MAX_BYTES) {
    throw new Error("La imagen no debe superar 20MB.");
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(ROOM_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "3600",
  });
  if (error) throw error;

  const { data } = supabase.storage.from(ROOM_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Borra del bucket los archivos detrás de estas URLs — "best effort":
 * ignora las que no vengan de nuestro bucket (rutas locales de
 * public/images/ o URLs externas, que nunca se tocan) y no lanza si
 * falla, para no interrumpir la operación principal (guardar/borrar un
 * tipo de habitación) por un problema de limpieza.
 */
export async function deleteRoomImageFiles(urls) {
  const paths = (urls ?? []).map(extractRoomImageStoragePath).filter(Boolean);
  if (paths.length === 0) return;

  try {
    await supabase.storage.from(ROOM_IMAGES_BUCKET).remove(paths);
  } catch {
    // Limpieza best-effort: un archivo huérfano ocasional no es grave.
  }
}

function extractRoomImageStoragePath(url) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${ROOM_IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

/** Traduce el error de FK (23503) que Postgres lanza al borrar un registro todavía referenciado. */
function translateDeleteError(error, entityLabel) {
  if (error.code === "23503") {
    return new Error(
      `No se puede eliminar: este ${entityLabel} todavía tiene registros asociados (reservas u otras habitaciones). Desactívalo en su lugar.`
    );
  }
  return error;
}
