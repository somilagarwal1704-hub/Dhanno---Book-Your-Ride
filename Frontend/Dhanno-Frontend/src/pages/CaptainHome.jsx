import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { CaptainDataContext } from "../context/CaptainContext.jsx";
import { api, errorMessage } from "../lib/api.js";
import { createSocket } from "../lib/socket.js";
import { inr } from "../lib/format.js";
import { useCaptainLocation } from "../hooks/useCaptainLocation.js";
import RideMap from "../components/map/RideMap.jsx";
import RideOffer from "../components/captain/RideOffer.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import Sheet from "../components/ui/Sheet.jsx";

const Metric = ({ icon, label, value, tone = "text-ink" }) => (
  <div className="rounded-2xl border border-line bg-surface p-3.5">
    <i className={`${icon} text-lg text-ink-3`} />
    <p className={`mt-1 text-lg font-bold ${tone}`}>{value}</p>
    <p className="text-xs text-ink-3">{label}</p>
  </div>
);

const CaptainHome = () => {
  const navigate = useNavigate();
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const [online, setOnline] = useState(captain?.status === "active");
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState("");
  const [summary, setSummary] = useState(null);
  const [offer, setOffer] = useState(null);
  const [offerBusy, setOfferBusy] = useState(false);
  const [socket, setSocket] = useState(null);
  const [fitSignal, setFitSignal] = useState(0);
  const [connected, setConnected] = useState(false);
  const offerRef = useRef(null);
  useEffect(() => {
    offerRef.current = offer;
  }, [offer]);

  const { position, error: gpsError } = useCaptainLocation(socket, true);

  const refreshSummary = useCallback(() => {
    api.get("/transactions/summary").then(({ data }) => setSummary(data)).catch(() => {});
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  // Socket: offers, offer closures, and a redirect if a ride is already underway.
  useEffect(() => {
    const s = createSocket("captain");
    setSocket(s);
    s.on("connect", () => {
      setConnected(true);
      api
        .get("/rides/active")
        .then(({ data }) => {
          if (data.ride && ["accepted", "in_progress"].includes(data.ride.status)) {
            navigate(`/captain/riding/${data.ride._id}`, { replace: true });
          }
        })
        .catch(() => {});
    });
    s.on("disconnect", () => setConnected(false));
    s.on("ride:offer", (payload) => {
      setOffer(payload);
      setOfferBusy(false);
      setFitSignal((n) => n + 1);
      if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
    });
    s.on("ride:offer-closed", (payload) => {
      if (offerRef.current && String(offerRef.current.rideId) === String(payload.rideId)) {
        setOffer(null);
        if (payload.reason === "cancelled") setToggleError("The rider cancelled that request.");
      }
    });
    return () => s.disconnect();
  }, [navigate]);

  const setStatus = async (next) => {
    setToggling(true);
    setToggleError("");
    try {
      const { data } = await api.patch("/captains/status", { online: next });
      setOnline(next);
      setCaptain?.(data.captain);
    } catch (err) {
      setToggleError(errorMessage(err, "Couldn't change your status."));
    } finally {
      setToggling(false);
    }
  };

  const accept = async () => {
    if (!offer) return;
    setOfferBusy(true);
    try {
      await api.post(`/rides/${offer.rideId}/accept`);
      navigate(`/captain/riding/${offer.rideId}`);
    } catch (err) {
      setOffer(null);
      setOfferBusy(false);
      setToggleError(errorMessage(err, "This ride was taken."));
    }
  };

  const decline = async () => {
    if (!offer) return;
    setOfferBusy(true);
    try {
      await api.post(`/rides/${offer.rideId}/decline`);
    } catch {
      /* The offer may already have expired server-side; either way it's gone. */
    } finally {
      setOffer(null);
      setOfferBusy(false);
    }
  };

  const expire = useCallback(() => setOffer(null), []);

  const firstName = captain?.fullname?.firstname ?? "Captain";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-canvas text-ink">
      <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
        <div className="min-w-0">
          <p className="text-xs text-ink-3">{greeting}</p>
          <h1 className="truncate text-xl font-bold">{firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/captain/earnings" aria-label="Earnings" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface">
            <i className="ri-wallet-3-line" />
          </Link>
          <ThemeToggle />
          <Link to="/captain/logout" aria-label="Log out" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface">
            <i className="ri-logout-box-r-line" />
          </Link>
        </div>
      </header>

      {/* Online switch */}
      <div className="px-5">
        <motion.div layout className={`flex items-center justify-between rounded-[1.25rem] border p-4 transition-colors ${online ? "border-success/40 bg-success/10" : "border-line bg-surface"}`}>
          <div className="flex items-center gap-3">
            <span className={`relative grid h-3 w-3 place-items-center`}>
              {online && <span className="absolute inset-0 animate-ping rounded-full bg-success/70" />}
              <span className={`relative h-3 w-3 rounded-full ${online ? "bg-success" : "bg-ink-3"}`} />
            </span>
            <div>
              <p className="font-semibold">{online ? "You're online" : "You're offline"}</p>
              <p className="text-xs text-ink-2">
                {online ? (connected ? "Ride requests will appear here" : "Reconnecting to live requests...") : "Go online to start receiving rides"}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={online}
            disabled={toggling}
            onClick={() => setStatus(!online)}
            className={`relative h-8 w-14 rounded-full transition-colors disabled:opacity-60 ${online ? "bg-success" : "bg-surface-3"}`}
          >
            <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow ${online ? "left-7" : "left-1"}`} />
          </button>
        </motion.div>
        {(toggleError || gpsError) && <p className="mt-2 text-sm text-danger">{toggleError || gpsError}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 px-5 py-4">
        <Metric icon="ri-hand-coin-line" label="Today" value={inr(summary?.todayEarnings)} tone="text-success" />
        <Metric icon="ri-taxi-line" label="Rides today" value={summary?.todayRides ?? 0} />
        <Metric icon="ri-star-line" label={`Rating${summary?.rating?.count ? ` · ${summary.rating.count}` : ""}`} value={summary?.rating?.count ? summary.rating.average.toFixed(1) : "New"} />
      </div>

      {/* Map */}
      <div className="relative mx-5 min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-line shadow-card">
        <RideMap
          captain={position ? { lat: position[0], lng: position[1], vehicleType: captain?.vehicle?.vehicleType } : null}
          fitSignal={fitSignal}
        />
        <button
          type="button"
          onClick={() => setFitSignal((n) => n + 1)}
          aria-label="Center on me"
          className="absolute bottom-3 right-3 z-[400] grid h-10 w-10 place-items-center rounded-full border border-line bg-surface shadow-card"
        >
          <i className="ri-focus-3-line" />
        </button>
      </div>

      <div className="px-5 pb-5 pt-4 text-center text-xs text-ink-3">
        <Link to="/captain/earnings" className="font-semibold text-ink underline underline-offset-4">View earnings</Link>
      </div>

      {/* Incoming offer */}
      <Sheet open={Boolean(offer)} label="Incoming ride">
        <AnimatePresence>
          {offer && (
            <RideOffer offer={offer} busy={offerBusy} onAccept={accept} onDecline={decline} onExpire={expire} />
          )}
        </AnimatePresence>
      </Sheet>
    </div>
  );
};

export default CaptainHome;
