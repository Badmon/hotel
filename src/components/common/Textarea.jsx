export function Textarea({ label, id, error, className = "", ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
          focus:border-[var(--color-primary)] focus:outline focus:outline-2 focus:outline-[var(--color-primary)]/30
          ${error ? "border-red-400" : "border-slate-300"}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
