import { useState } from "react";

/**
 * Muestra el id de un registro (uuid o entero) y lo copia completo al
 * portapapeles con un clic — pensado para poder pegarlo directo en
 * una consulta del SQL Editor de Supabase (ej. al investigar por qué
 * algo no se puede eliminar). Los uuid se truncan para que quepan en
 * una tarjeta; los enteros (habitaciones/tipos de habitación) ya son
 * cortos, así que se muestran completos.
 */
export function CopyableId({ id, className = "" }) {
  const [copied, setCopied] = useState(false);
  const text = String(id);
  const display = text.length > 12 ? `${text.slice(0, 8)}…` : text;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sin acceso al portapapeles (ej. contexto no seguro): no rompe nada.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar ID completo"
      className={`inline-flex items-center gap-1 rounded font-mono text-xs text-slate-400 hover:text-slate-600 ${className}`}
    >
      ID: {display}
      {copied && <span className="text-emerald-600">¡Copiado!</span>}
    </button>
  );
}
