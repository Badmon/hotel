export function ErrorMessage({ message, onRetry, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 py-8 text-center ${className}`} role="alert">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-medium text-red-700 underline underline-offset-2"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
