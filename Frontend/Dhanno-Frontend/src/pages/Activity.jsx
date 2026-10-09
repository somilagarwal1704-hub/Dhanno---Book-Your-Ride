import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { api, errorMessage } from "../lib/api.js";
import { dayLabel, formatTime, inr, VEHICLE_META } from "../lib/format.js";
import AppBar from "../components/ui/AppBar.jsx";
import StatusPill from "../components/ui/StatusPill.jsx";

const Activity = () => {
  const [rides, setRides] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/rides/history", { params: { limit: 50 } })
      .then(({ data }) => setRides(data.rides))
      .catch((err) => setError(errorMessage(err, "Couldn't load your rides.")));
  }, []);

  return (
    <div className="min-h-screen bg-canvas pb-10 text-ink">
      <AppBar title="Your rides" subtitle="Past and current trips" backTo="/home" />
      <main className="mx-auto max-w-xl space-y-3 px-5 pt-5">
        {error && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        {!rides && !error && [0, 1, 2].map((i) => <div key={i} className="dh-skeleton h-28" />)}

        {rides && rides.length === 0 && (
          <div className="rounded-card border border-dashed border-line p-10 text-center">
            <i className="ri-map-2-line text-4xl text-ink-3" />
            <p className="mt-3 font-semibold">No rides yet</p>
            <Link to="/home" className="mt-4 inline-block rounded-2xl bg-brand px-5 py-3 font-semibold text-brand-ink">Book your first ride</Link>
          </div>
        )}

        {rides?.map((r, i) => {
          const meta = VEHICLE_META[r.vehicleType];
          const active = ["pending", "accepted", "in_progress"].includes(r.status);
          return (
            <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={`/riding/${r._id}`} className="block rounded-card border border-line bg-surface p-4 transition hover:border-brand active:scale-[0.99]">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-ink-3">
                    {dayLabel(r.createdAt)} · {formatTime(r.createdAt)} · {meta?.label}
                  </p>
                  <StatusPill status={r.status} />
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  <p className="flex gap-2"><i className="ri-record-circle-line mt-0.5 text-success" /><span className="truncate">{r.pickup.address}</span></p>
                  <p className="flex gap-2"><i className="ri-map-pin-fill mt-0.5 text-danger" /><span className="truncate">{r.destination.address}</span></p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                  <p className="text-xs text-ink-3">
                    {r.captain ? `${r.captain.fullname?.firstname ?? "Captain"} · ${r.captain.vehicle?.vehicleType ?? ""}` : "No captain"}
                  </p>
                  <p className="font-bold">{inr(r.finalFare ?? r.fare)}</p>
                </div>
                {active && <p className="mt-2 text-xs font-semibold text-info">Tap to view live trip</p>}
              </Link>
            </motion.div>
          );
        })}
      </main>
    </div>
  );
};

export default Activity;
