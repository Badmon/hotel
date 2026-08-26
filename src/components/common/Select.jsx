export function Select({ label, id, error, options, className = "", ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900
          focus:border-[var(--color-primary)] focus:outline focus:outline-2 focus:outline-[var(--color-primary)]/30
          ${error ? "border-red-400" : "border-slate-300"}`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
