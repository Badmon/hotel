import { useEffect, useState } from "react";

/**
 * Input de fecha en formato dd/mm/aaaa, siempre — a propósito NO usa
 * <input type="date"> nativo: ese formato lo decide el idioma del
 * navegador de quien visita (mm/dd/yyyy en inglés, dd/mm/yyyy en
 * español...), no algo controlable de forma confiable entre
 * navegadores. Por fuera se comporta igual que cualquier input
 * controlado: `value`/`onChange` siguen trabajando con fecha ISO
 * "YYYY-MM-DD", así que nada más en el proyecto necesita cambiar.
 *
 * No valida el calendario (ej. 31/02 no se rechaza acá): eso ya lo
 * cubren las validaciones de negocio (utils/validation.js), que
 * revisan orden de fechas y fechas pasadas antes de enviar cualquier
 * formulario.
 */
export function DateInput({ id, label, value, onChange, error, hint, min: _min, max: _max, required, className = "", ...props }) {
  const [text, setText] = useState(() => isoToDisplay(value));

  useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  function handleChange(event) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
    setText(formatDigits(digits));
    onChange({ target: { value: digitsToIso(digits) } });
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        value={text}
        onChange={handleChange}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
          focus:border-[var(--color-primary)] focus:outline focus:outline-2 focus:outline-[var(--color-primary)]/30
          ${error ? "border-red-400" : "border-slate-300"}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        required={required}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

function isoToDisplay(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function formatDigits(digits) {
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [day, month, year].filter(Boolean).join("/");
}

function digitsToIso(digits) {
  if (digits.length < 8) return "";
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return `${year}-${month}-${day}`;
}
