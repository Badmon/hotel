import { useEffect, useRef, useState } from "react";

/**
 * Input de fecha en formato dd/mm/aaaa, siempre — a propósito no
 * confía en <input type="date"> para el TEXTO mostrado: ese formato lo
 * decide el idioma del navegador de quien visita (mm/dd/yyyy en
 * inglés, dd/mm/yyyy en español...), no algo controlable de forma
 * confiable entre navegadores.
 *
 * Por dentro sí mantiene un <input type="date"> oculto, sincronizado,
 * solo para poder abrir el selector de calendario nativo con el botón
 * — así no se pierde esa comodidad, solo el texto que se ve siempre es
 * dd/mm/aaaa sin importar el navegador.
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
  const nativeInputRef = useRef(null);

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

  function openPicker() {
    const input = nativeInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Algunos navegadores exigen que el click venga de interacción
        // directa del usuario; si showPicker() falla, se intenta con
        // foco + click como respaldo.
      }
    }
    input.focus();
    input.click();
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
        <button
          type="button"
          onClick={openPicker}
          aria-label="Abrir calendario"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
            <path strokeLinecap="round" d="M16 2.5v4M8 2.5v4M3.5 9.5h17" />
          </svg>
        </button>
        <input
          ref={nativeInputRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={value || ""}
          min={min}
          max={max}
          onChange={handleNativeChange}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        />
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
