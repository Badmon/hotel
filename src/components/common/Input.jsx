export function Input({ label, id, error, hint, className = "", ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
          focus:border-[var(--color-primary)] focus:outline focus:outline-2 focus:outline-[var(--color-primary)]/30
          ${error ? "border-red-400" : "border-slate-300"}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
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
