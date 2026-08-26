export function LoadingSpinner({ label = "Cargando...", className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-10 text-slate-500 ${className}`} role="status">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--color-primary)]" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
