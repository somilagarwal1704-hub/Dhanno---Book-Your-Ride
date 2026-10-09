const VARIANTS = {
  primary: "bg-brand text-brand-ink hover:brightness-105",
  dark: "bg-ink text-canvas hover:opacity-90",
  danger: "bg-danger text-white hover:brightness-110",
  success: "bg-success text-white hover:brightness-110",
  ghost: "bg-surface-2 text-ink hover:bg-surface-3",
  outline: "border border-line bg-surface text-ink hover:bg-surface-2",
};

const Button = ({
  variant = "primary",
  loading = false,
  full = true,
  className = "",
  children,
  disabled,
  ...props
}) => (
  <button
    type="button"
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[15px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${full ? "w-full" : ""} ${className}`}
    {...props}
  >
    {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
    {children}
  </button>
);

export default Button;
