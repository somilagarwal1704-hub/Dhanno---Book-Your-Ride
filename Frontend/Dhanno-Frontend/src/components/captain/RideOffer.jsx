import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { inr, VEHICLE_META } from "../../lib/format.js";

const TOTAL_MS = 15000;

/** Incoming ride offer with a live countdown ring. Auto-declines via `onExpire`. */
const RideOffer = ({ offer, busy, onAccept, onDecline, onExpire }) => {
  const [left, setLeft] = useState(TOTAL_MS);

  useEffect(() => {
    if (!offer) return undefined;
    const end = new Date(offer.expiresAt).getTime();
    const tick = () => {
      const remaining = Math.max(0, end - Date.now());
      setLeft(remaining);
      if (remaining === 0) onExpire?.();
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [offer, onExpire]);

  if (!offer) return null;

  const pct = left / TOTAL_MS;
  const circumference = 2 * Math.PI * 22;
  const meta = VEHICLE_META[offer.vehicleType];

  return (
    <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong">New ride request</p>
          <h3 className="text-xl font-bold text-ink">
            {offer.riderName} · {meta?.label}
          </h3>
        </div>
        <div className="relative grid h-14 w-14 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="22" className="fill-none stroke-surface-3" strokeWidth="4" />
            <circle
              cx="25"
              cy="25"
              r="22"
              className="fill-none stroke-brand transition-[stroke-dashoffset] duration-200"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct)}
            />
          </svg>
          <span className="text-sm font-bold text-ink">{Math.ceil(left / 1000)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface-2 p-3">
          <p className="text-xs text-ink-3">Fare</p>
          <p className="text-lg font-bold text-ink">{inr(offer.fare)}</p>
        </div>
        <div className="rounded-2xl bg-surface-2 p-3">
          <p className="text-xs text-ink-3">To pickup</p>
          <p className="text-lg font-bold text-ink">
            {offer.pickupEtaMin ? `${offer.pickupEtaMin} min` : "--"}
          </p>
          <p className="text-xs text-ink-3">{offer.pickupDistanceKm ? `${offer.pickupDistanceKm} km away` : ""}</p>
        </div>
      </div>

      <div className="space-y-2.5 rounded-2xl bg-surface-2 p-4 text-sm">
        <p className="flex gap-3 text-ink">
          <i className="ri-record-circle-line mt-0.5 text-success" />
          <span className="line-clamp-2">{offer.pickup?.address}</span>
        </p>
        <p className="flex gap-3 text-ink">
          <i className="ri-map-pin-fill mt-0.5 text-danger" />
          <span className="line-clamp-2">{offer.destination?.address}</span>
        </p>
        <p className="pt-1 text-xs text-ink-3">
          {offer.distance?.toFixed ? offer.distance.toFixed(1) : offer.distance} km · about {offer.duration} min trip
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        <button
          type="button"
          onClick={onDecline}
          disabled={busy}
          className="col-span-2 rounded-2xl bg-surface-3 py-4 font-semibold text-ink transition active:scale-95 disabled:opacity-50"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={busy}
          className="col-span-3 flex items-center justify-center gap-2 rounded-2xl bg-success py-4 font-bold text-white transition active:scale-95 disabled:opacity-60"
        >
          {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          Accept
        </button>
      </div>
    </motion.div>
  );
};

export default RideOffer;
