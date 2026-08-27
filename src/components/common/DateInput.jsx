import { useEffect, useState } from "react";

/**
 * Input de fecha en formato dd/mm/aaaa, siempre — a propósito no
 * confía en <input type="date"> para el TEXTO mostrado: ese formato lo
 * decide el idioma del navegador de quien visita (mm/dd/yyyy en
 * inglés, dd/mm/yyyy en español...), no algo controlable de forma
 * confiable entre navegadores.
 *
 * El ícono de calendario es, por dentro, un <input type="date"> real
 * del mismo tamaño que el ícono (invisible, superpuesto solo ahí) —
 * no un botón que dispara showPicker() por JS. showPicker() no es
 * confiable en todos los navegadores (en particular Safari/iOS puede
 * ignorarlo si no viene de una interacción directa sobre el propio
 * input), así que en vez de depender de esa API se deja que el toque
 * caiga directo sobre el input nativo: eso abre el selector con el
 * comportamiento por defecto del navegador, sin JS de por medio, y
 * funciona igual en desktop y mobile. El resto del campo (la parte de
 * texto) queda completamente libre de overlays para que escribir y el
 * autoformateo con "/" no tengan ninguna interferencia.
 *
 * Por fuera se comporta igual que un input controlado: value/onChange
 * siguen trabajando con fecha ISO "YYYY-MM-DD", así que nada más en el
 * proyecto necesita cambiar.
 *
 * No valida el calendario al escribir (ej. 31/02 no se rechaza acá):
 * eso ya lo cubren las validaciones de negocio (utils/validation.js).
 */
export function DateInput({ id, label, value, onChange, error, hint, min, max, required, className = "", ...props }) {
  const [text, setText] = useState(() => isoToDisplay(value));

  useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  function handleTextChange(event) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
    setText(formatDigits(digits));
    onChange({ target: { value: digitsToIso(digits) } });
  }

  function handleNativeChange(event) {
    onChange({ target: { value: event.target.value } });
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
          maxLength={10}
          value={text}
          onChange={handleTextChange}
          className={`w-full rounded-lg border py-2.5 pl-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400
            focus:border-[var(--color-primary)] focus:outline focus:outline-2 focus:outline-[var(--color-primary)]/30
            ${error ? "border-red-400" : "border-slate-300"}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          required={required}
          {...props}
        />
        <div className="absolute right-0 top-0 h-full w-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
            <path strokeLinecap="round" d="M16 2.5v4M8 2.5v4M3.5 9.5h17" />
          </svg>
          <input
            type="date"
            aria-label="Abrir calendario"
            value={value || ""}
            min={min}
            max={max}
            onChange={handleNativeChange}
            className="h-full w-full cursor-pointer opacity-0"
          />
        </div>
      </div>
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
