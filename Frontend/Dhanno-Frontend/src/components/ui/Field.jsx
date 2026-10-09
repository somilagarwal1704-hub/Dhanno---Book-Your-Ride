export const inputClass =
  "w-full rounded-2xl border border-line bg-surface-2 px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-3 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/20";

const Field = ({ label, icon, hint, className = "", ...props }) => (
  <label className={`block ${className}`}>
    {label && <span className="mb-1.5 block text-sm font-medium text-ink-2">{label}</span>}
    <span className="relative block">
      {icon && <i className={`${icon} pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3`} />}
      <input className={`${inputClass} ${icon ? "pl-11" : ""}`} {...props} />
    </span>
    {hint && <span className="mt-1.5 block text-xs text-ink-3">{hint}</span>}
  </label>
);

export default Field;
