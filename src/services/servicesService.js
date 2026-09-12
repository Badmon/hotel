import { supabase } from "../lib/supabaseClient";
import { getDefaultServiceIcon } from "../utils/serviceIcons";
import { SERVICE_TYPE } from "../constants/serviceType";

const SERVICE_COLUMNS = "id, name, type, icon, active";

/** Todos los servicios, activos e inactivos, para el panel administrativo. */
export async function fetchServicesForAdmin() {
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_COLUMNS)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Servicios de hotel, activos: se muestran automáticamente en toda habitación. */
export async function fetchHotelServices() {
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_COLUMNS)
    .eq("type", SERVICE_TYPE.HOTEL)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Todos los servicios activos, sin importar el tipo (hotel o por
 * habitación): para la vista general de "Servicios" de la home. Es una
 * lectura directa de la tabla (no pasa por room_type_services), así que
 * cada servicio aparece una sola vez sin importar a cuántos tipos de
 * habitación esté asignado.
 */
export async function fetchAllActiveServices() {
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_COLUMNS)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Servicios asignables por tipo de habitación, activos, para el multi-select del formulario. */
export async function fetchAssignableServices() {
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_COLUMNS)
    .eq("type", SERVICE_TYPE.ROOM)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createService({ name, type, active = true }) {
  const icon = getDefaultServiceIcon(name);
  const { data, error } = await supabase
    .from("services")
    .insert({ name, type, icon, active })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateService(id, { name, type, active }) {
  const icon = getDefaultServiceIcon(name);
  const { data, error } = await supabase
    .from("services")
    .update({ name, type, active, icon })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteService(id) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Reemplaza por completo los servicios asignados a un tipo de habitación.
 * Mismo patrón "borra todo e inserta de nuevo" que replaceRoomImages en
 * roomsService.js: la cantidad de servicios por habitación siempre es
 * chica, así que no hace falta un diff fila por fila.
 */
export async function replaceRoomTypeServices(roomTypeId, serviceIds) {
  const { error: deleteError } = await supabase
    .from("room_type_services")
    .delete()
    .eq("room_type_id", roomTypeId);
  if (deleteError) throw deleteError;

  if (serviceIds && serviceIds.length > 0) {
    const rows = serviceIds.map((serviceId) => ({ room_type_id: roomTypeId, service_id: serviceId }));
    const { error: insertError } = await supabase.from("room_type_services").insert(rows);
    if (insertError) throw insertError;
  }
}
