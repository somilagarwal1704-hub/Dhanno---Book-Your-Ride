import { useContext, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserDataContext } from "../context/UserContext.jsx";
import { api, errorMessage } from "../lib/api.js";
import { dayLabel, formatTime, inr } from "../lib/format.js";
import AppBar from "../components/ui/AppBar.jsx";
import Button from "../components/ui/Button.jsx";
import { inputClass } from "../components/ui/Field.jsx";

const TYPE_META = {
  topup: { icon: "ri-add-circle-fill", tone: "text-success", label: "Wallet top-up" },
  ride_payment: { icon: "ri-taxi-fill", tone: "text-ink", label: "Ride paid" },
  cash_ride: { icon: "ri-money-rupee-circle-fill", tone: "text-ink-2", label: "Ride paid in cash" },
  ride_earning: { icon: "ri-hand-coin-fill", tone: "text-success", label: "Ride earning" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "credit", label: "Money in" },
  { key: "debit", label: "Money out" },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000];

const Wallet = ({ role = "user" }) => {
  const isCaptain = role === "captain";
  const { user, setUser } = useContext(UserDataContext) ?? {};
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [topUp, setTopUp] = useState({ loading: false, error: "", success: "" });

  const load = async () => {
    setError("");
    try {
      const params = filter === "all" ? {} : { direction: filter };
      const [s, t] = await Promise.all([
        api.get("/transactions/summary"),
        api.get("/transactions", { params: { ...params, limit: 60 } }),
      ]);
      setSummary(s.data);
      setTransactions(t.data.transactions);
    } catch (err) {
      setError(errorMessage(err, "Couldn't load your wallet."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, role]);

  const grouped = useMemo(() => {
    const groups = new Map();
    transactions.forEach((t) => {
      const key = dayLabel(t.createdAt);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    });
    return [...groups.entries()];
  }, [transactions]);

  const submitTopUp = async (value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 10) {
      setTopUp({ loading: false, error: "Enter at least ₹10.", success: "" });
      return;
    }
    setTopUp({ loading: true, error: "", success: "" });
    try {
      const { data } = await api.post("/transactions/topup", { amount: n });
      if (setUser && user) setUser({ ...user, wallet: { ...(user.wallet || {}), balance: data.balance } });
      setAmount("");
      setTopUp({ loading: false, error: "", success: `${inr(n)} added to your wallet.` });
      load();
    } catch (err) {
      setTopUp({ loading: false, error: errorMessage(err, "Top-up failed."), success: "" });
    }
  };

  const balance = summary?.balance ?? (isCaptain ? 0 : user?.wallet?.balance ?? 0);

  return (
    <div className="min-h-screen bg-canvas pb-10 text-ink">
      <AppBar title={isCaptain ? "Earnings" : "Wallet"} subtitle={isCaptain ? "Your fares and payouts" : "Balance, top-ups and fares"} backTo={isCaptain ? "/captain/home" : "/home"} />

      <main className="mx-auto max-w-xl space-y-5 px-5 pt-5">
        {/* Balance card */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[1.5rem] bg-ink p-6 text-canvas shadow-card"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-success/20 blur-2xl" />
          <p className="relative text-sm text-canvas/70">{isCaptain ? "Digital earnings balance" : "Wallet balance"}</p>
          <p className="relative mt-1 text-4xl font-extrabold tracking-tight">{loading && !summary ? "..." : inr(balance)}</p>
          <div className="relative mt-5 grid grid-cols-2 gap-3 text-sm">
            {isCaptain ? (
              <>
                <Stat label="Today" value={inr(summary?.todayEarnings)} sub={`${summary?.todayRides ?? 0} rides`} />
                <Stat label="All time" value={inr(summary?.totalEarnings)} sub={`${summary?.ridesCompleted ?? 0} rides`} />
              </>
            ) : (
              <>
                <Stat label="Total spent" value={inr(summary?.totalSpent)} sub={`${summary?.ridesPaid ?? 0} rides`} />
                <Stat label="Added" value={inr(summary?.totalToppedUp)} sub="via top-ups" />
              </>
            )}
          </div>
        </motion.section>

        {/* Top-up (riders only) */}
        {!isCaptain && (
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="font-semibold">Add money</h2>
            <p className="mt-0.5 text-xs text-ink-3">Top-ups use a simulated payment gateway. No real money moves.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((q) => (
                <button key={q} type="button" onClick={() => submitTopUp(q)} disabled={topUp.loading} className="rounded-full border border-line bg-surface-2 px-4 py-2 text-sm font-semibold transition hover:border-brand active:scale-95 disabled:opacity-50">
                  + {inr(q)}
                </button>
              ))}
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                submitTopUp(amount);
              }}
            >
              <input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="Other amount"
                aria-label="Amount to add"
                className={inputClass}
              />
              <Button type="submit" full={false} loading={topUp.loading} className="shrink-0 !px-6">
                Add
              </Button>
            </form>
            <AnimatePresence>
              {topUp.error && <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-danger">{topUp.error}</motion.p>}
              {topUp.success && <motion.p key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-success">{topUp.success}</motion.p>}
            </AnimatePresence>
          </section>
        )}

        {/* History */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Transactions</h2>
            <div className="flex rounded-full bg-surface-2 p-1" role="tablist">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === f.key ? "bg-ink text-canvas" : "text-ink-2"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

          {loading && !transactions.length && (
            <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="dh-skeleton h-16" />)}</div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <div className="rounded-card border border-dashed border-line p-8 text-center">
              <i className="ri-receipt-line text-3xl text-ink-3" />
              <p className="mt-2 font-medium">No transactions yet</p>
              <p className="text-sm text-ink-3">{isCaptain ? "Complete a ride to see your earnings here." : "Your top-ups and rides will appear here."}</p>
            </div>
          )}

          <div className="space-y-5">
            {grouped.map(([day, items]) => (
              <div key={day}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">{day}</p>
                <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
                  {items.map((t, i) => {
                    const meta = TYPE_META[t.type] || { icon: "ri-exchange-line", tone: "text-ink", label: t.type };
                    const credit = t.direction === "credit";
                    return (
                      <motion.div key={t._id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="flex items-center gap-3 p-4">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 ${meta.tone}`}>
                          <i className={`${meta.icon} text-lg`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{meta.label}</p>
                          <p className="truncate text-xs text-ink-3">
                            {t.description} · {formatTime(t.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${credit ? "text-success" : "text-ink"}`}>
                            {credit ? "+" : "−"}
                            {inr(t.amount)}
                          </p>
                          <p className="text-[11px] uppercase tracking-wide text-ink-3">{t.method}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const Stat = ({ label, value, sub }) => (
  <div className="rounded-2xl bg-canvas/10 p-3">
    <p className="text-xs text-canvas/70">{label}</p>
    <p className="mt-0.5 text-lg font-bold">{value}</p>
    <p className="text-xs text-canvas/60">{sub}</p>
  </div>
);

export default Wallet;
