const VARIANT_STYLES = {
  primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] focus-visible:outline-[var(--color-primary)]",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:outline-slate-400",
  outline: "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 focus-visible:outline-[var(--color-primary)]",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-400",
};

const SIZE_STYLES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        disabled:cursor-not-allowed disabled:opacity-60
        ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
