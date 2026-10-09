import { inr } from "../../lib/format.js";

const Row = ({ label, value, strong }) => (
  <div className={`flex items-center justify-between text-sm ${strong ? "text-base font-bold text-ink" : "text-ink-2"}`}>
    <span>{label}</span>
    <span className={strong ? "" : "text-ink"}>{value}</span>
  </div>
);

/** Fare breakdown. `perspective` decides which side's numbers are shown. */
const Receipt = ({ receipt, perspective = "user" }) => {
  if (!receipt) return null;
  const method = receipt.paymentMethod === "wallet" ? "Wallet" : "Cash";
  return (
    <div className="space-y-3 rounded-2xl bg-surface-2 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Trip receipt</p>
        <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">Paid · {method}</span>
      </div>
      <Row label="Trip fare" value={inr(receipt.fare)} />
      {perspective === "captain" && <Row label="Platform fee (20%)" value={`- ${inr(receipt.commission)}`} />}
      <div className="border-t border-line pt-3">
        {perspective === "captain" ? (
          <Row label="You earn" value={inr(receipt.captainShare)} strong />
        ) : (
          <Row label="Total paid" value={inr(receipt.fare)} strong />
        )}
      </div>
    </div>
  );
};

export default Receipt;
