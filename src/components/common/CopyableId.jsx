import { useState } from "react";

/**
 * Muestra el UUID de un registro, truncado, y lo copia completo al
 * portapapeles con un clic — pensado para poder pegarlo directo en
 * una consulta del SQL Editor de Supabase (ej. al investigar por qué
 * algo no se puede eliminar).
 */
export function CopyableId({ id, className = "" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(id);
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
      ID: {id.slice(0, 8)}…{copied && <span className="text-emerald-600">¡Copiado!</span>}
    </button>
  );
}
