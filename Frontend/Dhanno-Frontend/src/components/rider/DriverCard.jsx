const VEHICLE_ICON = { car: "ri-car-fill", auto: "ri-taxi-fill", bike: "ri-motorbike-fill" };

const initials = (name = "") => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "CP";

const DriverCard = ({ captain, unread = 0, onChat, showChat = true }) => {
  if (!captain) return null;
  const name = `${captain.fullname?.firstname ?? ""} ${captain.fullname?.lastname ?? ""}`.trim() || "Your captain";
  const rating = captain.rating?.count ? captain.rating.average.toFixed(1) : null;
  const vehicle = captain.vehicle;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-canvas">
        {initials(name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{name}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-ink-2">
          <i className={VEHICLE_ICON[vehicle?.vehicleType] || "ri-car-fill"} />
          {vehicle?.color} {vehicle?.vehicleType} · <span className="font-semibold text-ink">{vehicle?.plate}</span>
        </p>
        {rating && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-2">
            <i className="ri-star-fill text-brand-strong" /> {rating} ({captain.rating.count})
          </p>
        )}
      </div>
      {showChat && onChat && (
        <button
          type="button"
          onClick={onChat}
          aria-label="Open chat"
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-brand-ink transition active:scale-95"
        >
          <i className="ri-chat-3-fill text-lg" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default DriverCard;
