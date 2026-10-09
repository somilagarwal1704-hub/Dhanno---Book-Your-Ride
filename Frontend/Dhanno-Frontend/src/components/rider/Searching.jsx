import { motion } from "motion/react";

/** Radar-style search state shown while the ride is offered to captains. */
const Searching = ({ message, failed, onCancel, onRetry, retrying, vehicleLabel, fare }) => (
  <div className="text-center">
    <div className="relative mx-auto mb-4 grid h-36 w-36 place-items-center">
      {!failed && (
        <>
          <span className="dh-radar-ring" />
          <span className="dh-radar-ring" />
          <span className="dh-radar-ring" />
        </>
      )}
      <motion.div
        animate={failed ? {} : { rotate: [0, -8, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="relative grid h-20 w-20 place-items-center rounded-full bg-brand text-brand-ink shadow-card"
      >
        <i className={failed ? "ri-error-warning-line text-3xl" : "ri-taxi-line text-3xl"} />
      </motion.div>
    </div>

    <h2 className="text-xl font-bold text-ink">
      {failed ? "No captain yet" : "Finding your captain"}
    </h2>
    <p className="mx-auto mt-1 max-w-xs text-sm text-ink-2">{message}</p>
    {vehicleLabel && (
      <p className="mt-3 text-xs text-ink-3">
        {vehicleLabel} · {fare !== undefined && `₹${fare}`}
      </p>
    )}

    <div className="mt-6 space-y-2.5">
      {failed && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="w-full rounded-2xl bg-brand py-3.5 font-semibold text-brand-ink transition active:scale-[0.98] disabled:opacity-60"
        >
          {retrying ? "Retrying..." : "Try again"}
        </button>
      )}
      <button
        type="button"
        onClick={onCancel}
        className="w-full rounded-2xl border border-danger/40 py-3.5 font-semibold text-danger transition active:scale-[0.98]"
      >
        Cancel ride
      </button>
    </div>
  </div>
);

export default Searching;
