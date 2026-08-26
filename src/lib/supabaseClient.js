import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  // eslint-disable-next-line no-console
  console.error(
    "Faltan variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
      "Copia .env.example a .env y complétalo (ver README.md). " +
      "La app va a renderizar, pero cualquier llamada a Supabase fallará hasta que lo configures."
  );
}

/**
 * Cliente de Supabase para el frontend. Utiliza únicamente la anon key,
 * que es segura para exponer en el navegador porque toda la protección
 * real vive en las políticas de Row Level Security de Postgres.
 *
 * Nunca importar aquí la service role key.
 */
// Si faltan las variables de entorno, usamos una URL con forma válida
// para que createClient no lance una excepción al importarse (lo que
// dejaría toda la app en blanco). Las llamadas reales igual fallarán,
// pero de forma controlada: cada hook/servicio las captura y muestra
// un estado de error en la UI en vez de una pantalla en blanco.
export const supabase = createClient(
  isConfigured ? supabaseUrl : "https://missing-config.supabase.co",
  isConfigured ? supabaseAnonKey : "missing-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
