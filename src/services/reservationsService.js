import { supabase } from "../lib/supabaseClient";

/**
 * Creación pública de una reserva. Se hace vía Netlify Function (no
 * insertando directamente en la tabla) porque ahí se revalida todo en
 * el servidor: fechas, capacidad, disponibilidad y generación del
 * código de reserva. El frontend nunca tiene permiso de INSERT en
 * `reservations` (ver RLS en supabase/migrations).
 */
export async function createReservation(payload) {
  const response = await fetch("/.netlify/functions/create-reservation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error || "No fue posible enviar tu solicitud.");
  }

  return result.reservation;
}

/**
 * Búsqueda pública de una reserva por código + correo (para cuando el
 * huésped perdió la pantalla de confirmación). Vía RPC SECURITY
 * DEFINER: anon no tiene SELECT sobre reservations, así que esta
 * función es la única puerta de lectura pública, y exige ambos datos
 * exactos para devolver algo.
 */
export async function findReservationByCode(reservationCode, guestEmail) {
  const { data, error } = await supabase.rpc("find_reservation_by_code", {
    p_reservation_code: reservationCode,
    p_guest_email: guestEmail,
  });

  if (error) throw error;
  return data?.[0] ?? null;
}

/**
 * Búsqueda pública de reservas cuando el huésped perdió el código
 * mismo: exige correo + teléfono (no solo uno) y devuelve como máximo
 * las 10 más recientes que coincidan con ambos.
 */
export async function findReservationsByContact(guestEmail, guestPhone) {
  const { data, error } = await supabase.rpc("find_reservations_by_contact", {
    p_guest_email: guestEmail,
    p_guest_phone: guestPhone,
  });

  if (error) throw error;
  return data ?? [];
}

/** Uso administrativo: listar reservas con filtros. Requiere sesión staff/admin (RLS). */
export async function fetchReservations({ status, search, fromDate, toDate } = {}) {
  let query = supabase
    .from("reservations")
    .select(
      `id, reservation_code, guest_name, guest_email, guest_phone, guest_count,
       booking_mode, check_in_date, check_out_date, check_in_at, check_out_at, status, created_at,
       rooms ( id, room_number, room_types ( id, name ) )`
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (fromDate) query = query.gte("check_in_date", fromDate);
  if (toDate) query = query.lte("check_out_date", toDate);
  if (search) {
    query = query.or(
      `guest_name.ilike.%${search}%,reservation_code.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchReservationById(id) {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `*, rooms ( id, room_number, floor, room_types ( id, name, capacity, base_price, hourly_price ) )`
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchTodayArrivals(today) {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `id, reservation_code, guest_name, guest_count, check_in_date, check_out_date, status,
       rooms ( id, room_number, room_types ( name ) )`
    )
    .eq("check_in_date", today)
    .in("status", ["confirmed", "pending"])
    .order("guest_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchTodayDepartures(today) {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `id, reservation_code, guest_name, guest_count, check_in_date, check_out_date, status,
       rooms ( id, room_number, room_types ( name ) )`
    )
    .eq("check_out_date", today)
    .eq("status", "checked_in")
    .order("guest_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchDashboardStats(today) {
  const [
    { count: pendingCount },
    { count: confirmedCount },
    { count: checkedInCount },
  ] = await Promise.all([
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("status", "checked_in"),
  ]);

  const [arrivals, departures] = await Promise.all([
    fetchTodayArrivals(today),
    fetchTodayDepartures(today),
  ]);

  return {
    pendingCount: pendingCount ?? 0,
    confirmedCount: confirmedCount ?? 0,
    checkedInCount: checkedInCount ?? 0,
    todayArrivalsCount: arrivals.length,
    todayDeparturesCount: departures.length,
  };
}

export async function fetchReservationsByDateRange(fromDate, toDate) {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `id, reservation_code, guest_name, booking_mode, check_in_date, check_out_date,
       check_in_at, check_out_at, status,
       rooms ( id, room_number, room_types ( name ) )`
    )
    .lte("check_in_date", toDate)
    .gte("check_out_date", fromDate)
    .order("check_in_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Acciones administrativas de cambio de estado. Se ejecutan como
 * funciones SQL (RPC) que corren dentro de Postgres: ahí se revalida el
 * rol del usuario, la transición de estado permitida y, para
 * `confirm_reservation`, se vuelve a comprobar disponibilidad para
 * evitar reservas dobles por condiciones de carrera.
 */
async function callReservationAction(fnName, reservationId, extra = {}) {
  const { data, error } = await supabase.rpc(fnName, {
    p_reservation_id: reservationId,
    ...extra,
  });
  if (error) throw error;
  return data;
}

export const confirmReservation = (id) => callReservationAction("confirm_reservation", id);
export const rejectReservation = (id) => callReservationAction("reject_reservation", id);
export const cancelReservation = (id) => callReservationAction("cancel_reservation", id);
export const checkInReservation = (id) => callReservationAction("checkin_reservation", id);
export const checkOutReservation = (id) => callReservationAction("checkout_reservation", id);
export const markReservationNoShow = (id) => callReservationAction("no_show_reservation", id);
