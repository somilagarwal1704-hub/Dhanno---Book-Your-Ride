import { motion } from "motion/react";
import { inr, VEHICLE_META, formatDistance } from "../../lib/format.js";

const CarIcon = ({ type }) => {
  const meta = VEHICLE_META[type];
  if (meta.image === "car") {
    return <img src="/vehicles/car.png" alt="" className="h-11 w-16 object-contain" />;
  }
  if (meta.image === "auto") {
    return <img src="/vehicles/auto.jpg" alt="" className="h-11 w-16 rounded-lg object-cover" />;
  }
  return <i className={`${meta.icon} text-4xl text-ink`} />;
};

const VehiclePicker = ({ estimate, loading, distanceKm, durationMin, selected, onSelect, onContinue }) => {
  const vehicles = estimate?.vehicles;
  const surging = estimate?.surge > 1;

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">Choose a ride</h2>
          <p className="text-sm text-ink-2">
            {formatDistance(distanceKm)} · about {durationMin} min trip
          </p>
        </div>
        {surging && (
          <span className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-3 py-1 text-xs font-semibold text-danger">
            <i className="ri-flashlight-fill" /> Peak fares · {estimate.surge}x
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {Object.keys(VEHICLE_META).map((type) => {
          const meta = VEHICLE_META[type];
          const option = vehicles?.[type];
          const active = selected === type;
          const none = option && option.availableCount === 0;
          return (
            <motion.button
              key={type}
              type="button"
              layout
              disabled={!option || none}
              onClick={() => onSelect(type)}
              whileTap={{ scale: 0.98 }}
              className={`flex w-full items-center gap-4 rounded-2xl border-2 p-3 text-left transition ${
                active ? "border-brand bg-brand/10" : "border-line bg-surface-2"
              } ${none ? "opacity-50" : ""}`}
            >
              <div className="grid w-20 shrink-0 place-items-center">
                <CarIcon type={type} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold text-ink">
                  {meta.label}
                  <span className="inline-flex items-center gap-0.5 text-xs font-normal text-ink-2">
                    <i className="ri-user-3-line" />
                    {meta.seats}
                  </span>
                </p>
                <p className="text-xs text-ink-2">
                  {loading || !option
                    ? "Calculating..."
                    : none
                      ? "No drivers nearby"
                      : option.pickupEtaMin
                        ? `${option.pickupEtaMin} min away · ${option.availableCount} online`
                        : `${option.availableCount} online`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-ink">{option ? inr(option.fare) : "--"}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!selected || !vehicles?.[selected] || vehicles?.[selected]?.availableCount === 0}
        className="mt-5 w-full rounded-2xl bg-ink py-4 text-[15px] font-semibold text-canvas transition active:scale-[0.98] disabled:opacity-40"
      >
        {selected ? `Continue with ${VEHICLE_META[selected].label}` : "Select a ride"}
      </button>
    </div>
  );
};

export default VehiclePicker;
