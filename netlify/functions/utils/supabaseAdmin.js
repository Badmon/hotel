import { createClient } from "@supabase/supabase-js";
import ws from "ws";

/**
 * Cliente de Supabase con la service role key. Solo debe usarse dentro
 * de Netlify Functions (nunca en el frontend): tiene privilegios para
 * saltarse Row Level Security, así que cada función que lo use es
 * responsable de validar todo antes de tocar la base de datos.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en Netlify.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
    // supabase-js inicializa un cliente de Realtime aunque no lo usemos
    // (solo hacemos .rpc() por HTTP). En Node < 22, sin WebSocket
    // nativo, eso revienta el arranque del cliente si no se le pasa un
    // polyfill explícito.
    realtime: { transport: ws },
  });
}
