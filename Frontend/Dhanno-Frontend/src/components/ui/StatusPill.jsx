import { STATUS_META } from "../../lib/format.js";

const TONES = {
  warn: "bg-brand/20 text-brand-strong",
  info: "bg-info/15 text-info",
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
};

const StatusPill = ({ status, label, className = "" }) => {
  const meta = STATUS_META[status] || { label: status, tone: "info" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${TONES[meta.tone]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label || meta.label}
    </span>
  );
};

export default StatusPill;
