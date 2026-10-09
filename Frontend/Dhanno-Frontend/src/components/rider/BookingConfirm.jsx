import { motion } from "motion/react";
import { inr, VEHICLE_META, formatDistance } from "../../lib/format.js";

const PaymentOption = ({ active, icon, title, subtitle, disabled, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`flex flex-1 items-center gap-3 rounded-2xl border-2 p-3 text-left transition disabled:opacity-40 ${
      active ? "border-brand bg-brand/10" : "border-line bg-surface-2"
    }`}
  >
    <i className={`${icon} text-xl text-ink`} />
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-ink">{title}</span>
      <span className="block truncate text-xs text-ink-2">{subtitle}</span>
    </span>
  </button>
);

const BookingConfirm = ({
  vehicle,
  fare,
  distanceKm,
  durationMin,
  pickup,
  destination,
  paymentMethod,
  onPaymentChange,
  walletBalance,
  onConfirm,
  onBack,
  loading,
  error,
}) => {
  const meta = VEHICLE_META[vehicle];
  const walletShort = walletBalance < fare;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Back to rides" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-ink">
          <i className="ri-arrow-left-line" />
        </button>
        <h2 className="text-xl font-bold text-ink">Confirm your {meta.label.toLowerCase()}</h2>
      </div>

      <div className="space-y-2 rounded-2xl bg-surface-2 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-success" />
          <p className="line-clamp-2 text-sm text-ink">{pickup.label}</p>
        </div>
        <div className="ml-[5px] h-4 border-l-2 border-dashed border-ink-3" />
        <div className="flex items-start gap-3">
          <i className="ri-map-pin-fill mt-0.5 text-danger" />
          <p className="line-clamp-2 text-sm text-ink">{destination.label}</p>
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3 text-sm text-ink-2">
          <span>
            {formatDistance(distanceKm)} · {durationMin} min
          </span>
          <motion.span key={fare} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-2xl font-bold text-ink">
            {inr(fare)}
          </motion.span>
        </div>
      </div>

      <p className="mb-2 mt-5 text-sm font-semibold text-ink">Pay with</p>
      <div className="flex gap-2.5">
        <PaymentOption
          active={paymentMethod === "cash"}
          icon="ri-money-rupee-circle-line"
          title="Cash"
          subtitle="Pay the driver"
          onClick={() => onPaymentChange("cash")}
        />
        <PaymentOption
          active={paymentMethod === "wallet"}
          icon="ri-wallet-3-line"
          title="Wallet"
          subtitle={`${inr(walletBalance)} available`}
          disabled={walletShort}
          onClick={() => onPaymentChange("wallet")}
        />
      </div>
      {walletShort && (
        <p className="mt-2 text-xs text-ink-3">Top up your wallet to pay with it for this ride.</p>
      )}

      {error && <p className="mt-4 rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-[15px] font-bold text-brand-ink transition active:scale-[0.98] disabled:opacity-60"
      >
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        Book {meta.label} · {inr(fare)}
      </button>
    </div>
  );
};

export default BookingConfirm;
