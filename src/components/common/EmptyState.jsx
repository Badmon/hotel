export function EmptyState({ title, description, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 py-12 text-center ${className}`}>
      <p className="text-base font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
