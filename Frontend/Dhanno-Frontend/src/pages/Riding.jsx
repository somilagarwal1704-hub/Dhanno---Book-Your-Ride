import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { api, errorMessage } from "../lib/api.js";
import { createSocket } from "../lib/socket.js";
import { fetchRoute, formatTime, inr, VEHICLE_META, formatDistance } from "../lib/format.js";
import RideMap, { RecenterButton } from "../components/map/RideMap.jsx";
import DriverCard from "../components/rider/DriverCard.jsx";
import ChatPanel from "../components/chat/ChatPanel.jsx";
import Receipt from "../components/ride/Receipt.jsx";
import RatingForm from "../components/ride/RatingForm.jsx";
import StatusPill from "../components/ui/StatusPill.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";

const haversineKm = (a, b) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const OtpDigits = ({ otp }) => (
  <div className="flex justify-center gap-2.5" aria-label={`One time code ${otp.split("").join(" ")}`}>
    {otp.split("").map((d, i) => (
      <motion.span
        key={`${i}-${d}`}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 18 }}
        className="grid h-14 w-12 place-items-center rounded-2xl border-2 border-brand bg-brand/10 font-mono text-2xl font-bold text-ink"
      >
        {d}
      </motion.span>
    ))}
  </div>
);

const Riding = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [captainPos, setCaptainPos] = useState(null);
  const [route, setRoute] = useState([]);
  const [fitSignal, setFitSignal] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [rating, setRating] = useState({ loading: false, error: "" });
  const [notice, setNotice] = useState("");
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    api
      .get(`/rides/${rideId}`)
      .then(({ data }) => {
        if (cancelled) return;
        if (data.ride.status === "pending") {
          navigate("/home", { replace: true });
          return;
        }
        setRide(data.ride);
        if (data.ride.captain?.location?.lat) {
          setCaptainPos({ lat: data.ride.captain.location.lat, lng: data.ride.captain.location.long });
        }
      })
      .catch((err) => !cancelled && setLoadError(errorMessage(err, "We couldn't load this ride.")));
    return () => {
      cancelled = true;
    };
  }, [rideId, navigate]);

  // Real-time updates for this ride
  useEffect(() => {
    const s = createSocket("user");
    socketRef.current = s;
    setSocket(s);

    const join = () => s.emit("ride:join", { rideId }, () => {});
    s.on("connect", join);

    const applyView = (payload) => {
      setRide((prev) => ({ ...(prev || {}), ...payload }));
    };

    s.on("ride:accepted", (p) => {
      applyView(p);
      setNotice("Your captain accepted the ride.");
      setFitSignal((n) => n + 1);
    });
    s.on("ride:started", (p) => {
      applyView(p);
      setNotice("Trip started. Enjoy the ride!");
      setFitSignal((n) => n + 1);
    });
    s.on("ride:completed", (p) => {
      applyView(p);
      setReceipt(p.receipt || null);
      setChatOpen(false);
    });
    s.on("ride:cancelled", (p) => {
      setRide((prev) => (prev ? { ...prev, status: "cancelled", cancelledBy: p.cancelledBy } : prev));
      setNotice(p.message);
    });
    s.on("captain:location", (p) => {
      if (String(p.rideId) === String(rideId)) setCaptainPos({ lat: p.lat, lng: p.lng });
    });

    return () => {
      s.emit("ride:leave", { rideId });
      s.disconnect();
    };
  }, [rideId]);

  // Live receipt from the socket, or a fare-only receipt for completed trips loaded fresh.
  const shownReceipt =
    receipt ??
    (ride?.status === "completed"
      ? { fare: ride.finalFare ?? ride.fare, commission: 0, captainShare: 0, paymentMethod: ride.paymentMethod }
      : null);

  const pickup = ride ? [ride.pickup.location.lat, ride.pickup.location.lng] : null;
  const destination = ride ? [ride.destination.location.lat, ride.destination.location.lng] : null;
  const status = ride?.status;

  // Route: captain -> pickup while waiting, pickup -> destination on trip.
  const routeKey = status === "accepted" ? "to-pickup" : status === "in_progress" ? "trip" : "";
  useEffect(() => {
    if (!routeKey) return undefined;
    let cancelled = false;
    const from = routeKey === "to-pickup" ? captainPos && [captainPos.lat, captainPos.lng] : pickup;
    const to = routeKey === "to-pickup" ? pickup : destination;
    if (!from || !to) return undefined;
    fetchRoute(from, to)
      .then((r) => !cancelled && setRoute(r.coords))
      .catch(() => !cancelled && setRoute([]));
    return () => {
      cancelled = true;
    };
    // Re-route when the phase changes, or when the captain has moved ~200 m.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey, rideId, routeKey === "to-pickup" ? captainGrid : ""]);

  const captainTrack = useMemo(() => {
    if (!captainPos || !ride || status !== "accepted") return null;
    const km = haversineKm([captainPos.lat, captainPos.lng], [ride.pickup.location.lat, ride.pickup.location.lng]);
    return { km, min: Math.max(1, Math.round((km / 25) * 60)) };
  }, [captainPos, ride, status]);

  // Rounded to ~200 m, so the route refreshes when the captain has really moved, not on every GPS tick.
  const captainGrid = captainPos ? `${Math.round(captainPos.lat * 500)}:${Math.round(captainPos.lng * 500)}` : "";

  const cancelRide = async () => {
    if (!window.confirm("Cancel this ride? Your captain will be notified.")) return;
    setCancelling(true);
    try {
      const { data } = await api.post(`/rides/${rideId}/cancel`, { reason: "Cancelled by rider" });
      setRide(data.ride);
    } catch (err) {
      setNotice(errorMessage(err, "Couldn't cancel this ride."));
    } finally {
      setCancelling(false);
    }
  };

  const submitRating = async ({ stars, comment }) => {
    setRating({ loading: true, error: "" });
    try {
      const { data } = await api.post(`/rides/${rideId}/rate`, { stars, comment });
      setRide(data.ride);
      setRating({ loading: false, error: "" });
    } catch (err) {
      setRating({ loading: false, error: errorMessage(err, "Couldn't save your rating.") });
    }
  };

  const shareTrip = async () => {
    const text = `I'm on a Dhanno trip to ${ride.destination.address}. Captain: ${ride.captain?.fullname?.firstname ?? ""} · ${ride.captain?.vehicle?.plate ?? ""}`;
    if (navigator.share) {
      navigator.share({ title: "My Dhanno trip", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      setNotice("Trip details copied to clipboard.");
    }
  };

  if (loadError) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas p-6 text-center text-ink">
        <div>
          <p className="text-lg font-semibold">{loadError}</p>
          <Link to="/home" className="mt-4 inline-block rounded-2xl bg-ink px-5 py-3 font-semibold text-canvas">Back to home</Link>
        </div>
      </div>
    );
  }

  if (!ride) {
    return <div className="grid min-h-screen place-items-center bg-canvas"><div className="dh-skeleton h-40 w-72" /></div>;
  }

  const meta = VEHICLE_META[ride.vehicleType];
  const captainName = ride.captain?.fullname?.firstname ?? "your captain";
  const canChat = ["accepted", "in_progress"].includes(status);
  const isDone = status === "completed";
  const isCancelled = status === "cancelled";
  const mapRoute = route;

  return (
    <div className="fixed inset-0 overflow-hidden bg-canvas">
      <RideMap
        pickup={pickup}
        destination={destination}
        captain={captainPos && ride.captain ? { ...captainPos, vehicleType: ride.captain.vehicle?.vehicleType } : null}
        route={mapRoute}
        fitSignal={fitSignal}
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-4">
        <Link to="/home" aria-label="Back to home" className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-ink shadow-card">
          <i className="ri-arrow-left-line text-lg" />
        </Link>
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 shadow-card">
          <StatusPill status={status} />
        </div>
        <ThemeToggle className="pointer-events-auto" />
      </header>

      <div className="absolute right-4 top-[38%] z-10">
        <RecenterButton onClick={() => setFitSignal((n) => n + 1)} />
      </div>

      <AnimatePresence>
        {notice && (
          <motion.button
            key={notice}
            type="button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotice("")}
            className="absolute left-1/2 top-20 z-20 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-ink px-4 py-3 text-left text-sm text-canvas shadow-card"
          >
            {notice}
          </motion.button>
        )}
      </AnimatePresence>

      <motion.section
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        className="absolute inset-x-0 bottom-0 z-10 max-h-[62%] overflow-y-auto rounded-t-[1.75rem] border-t border-line bg-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-card dh-no-scrollbar"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-surface-3" />

        {status === "accepted" && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-ink">
                {captainTrack ? `${captainName} arrives in ~${captainTrack.min} min` : `${captainName} is on the way`}
              </h2>
              <p className="mt-1 text-sm text-ink-2">
                {captainTrack
                  ? `${captainTrack.km < 1 ? `${Math.round(captainTrack.km * 1000)} m` : `${captainTrack.km.toFixed(1)} km`} away from your pickup · live`
                  : "Waiting for your captain's live location..."}
              </p>
              <p className="mt-3 text-sm text-ink-2">Share this code with your captain to start the trip.</p>
              <button
                type="button"
                onClick={() => setFitSignal((n) => n + 1)}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-sm font-semibold text-ink transition active:scale-95"
              >
                <i className="ri-map-pin-user-line" /> Track captain on map
              </button>
            </div>
            {ride.otp && <OtpDigits otp={ride.otp} />}
            <DriverCard captain={ride.captain} unread={unread} onChat={() => setChatOpen(true)} />
            <button
              type="button"
              onClick={cancelRide}
              disabled={cancelling}
              className="w-full rounded-2xl border border-danger/40 py-3.5 font-semibold text-danger transition active:scale-[0.98] disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel ride"}
            </button>
          </div>
        )}

        {status === "in_progress" && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-success">On trip</p>
              <h2 className="text-xl font-bold text-ink">Heading to {ride.destination.address.split(",")[0]}</h2>
              <p className="mt-1 text-sm text-ink-2">
                {formatDistance(ride.distance || 0)} · started {formatTime(ride.startedAt)}
              </p>
            </div>
            <DriverCard captain={ride.captain} unread={unread} onChat={() => setChatOpen(true)} />
            <button type="button" onClick={shareTrip} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-surface-2 py-3.5 font-semibold text-ink transition active:scale-[0.98]">
              <i className="ri-share-forward-line" /> Share trip details
            </button>
          </div>
        )}

        {isDone && (
          <div className="space-y-5">
            <div className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
                <i className="ri-check-line text-3xl" />
              </span>
              <h2 className="mt-3 text-xl font-bold text-ink">You've arrived</h2>
              <p className="text-sm text-ink-2">
                {meta?.label} · {ride.destination.address.split(",")[0]}
              </p>
            </div>
            <Receipt receipt={shownReceipt} perspective="user" />
            {ride.rating?.stars ? (
              <div className="rounded-2xl bg-surface-2 p-4 text-center">
                <p className="text-sm text-ink-2">Thanks for rating {captainName}</p>
                <p className="mt-1 text-2xl text-brand-strong">{"★".repeat(ride.rating.stars)}<span className="text-ink-3">{"★".repeat(5 - ride.rating.stars)}</span></p>
              </div>
            ) : (
              <RatingForm name={captainName} onSubmit={submitRating} submitting={rating.loading} error={rating.error} />
            )}
            <Link to="/home" className="block rounded-2xl bg-ink py-3.5 text-center font-semibold text-canvas transition active:scale-[0.98]">
              Book another ride
            </Link>
          </div>
        )}

        {isCancelled && (
          <div className="space-y-4 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-danger/15 text-danger">
              <i className="ri-close-line text-3xl" />
            </span>
            <h2 className="text-xl font-bold text-ink">Ride cancelled</h2>
            <p className="text-sm text-ink-2">{ride.cancelReason || "This ride was cancelled."}</p>
            <Link to="/home" className="block rounded-2xl bg-brand py-3.5 font-semibold text-brand-ink transition active:scale-[0.98]">
              Book a new ride
            </Link>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
          <div className="min-w-0">
            <p className="truncate text-ink-2">{ride.pickup.address.split(",")[0]} → {ride.destination.address.split(",")[0]}</p>
          </div>
          <p className="shrink-0 font-semibold text-ink">{inr(ride.finalFare ?? ride.fare)}</p>
        </div>
      </motion.section>

      {canChat && ride.captain && (
        <ChatPanel
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          rideId={rideId}
          socket={socket}
          selfRole="user"
          otherName={captainName}
          onUnreadChange={setUnread}
        />
      )}
    </div>
  );
};

export default Riding;
