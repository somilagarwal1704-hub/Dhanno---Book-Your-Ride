import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { CaptainDataContext } from "../context/CaptainContext.jsx";
import { api, errorMessage, errorCode } from "../lib/api.js";
import { createSocket } from "../lib/socket.js";
import { directionsUrl, fetchRoute, inr, VEHICLE_META } from "../lib/format.js";
import { useCaptainLocation } from "../hooks/useCaptainLocation.js";
import RideMap, { RecenterButton } from "../components/map/RideMap.jsx";
import ChatPanel from "../components/chat/ChatPanel.jsx";
import Receipt from "../components/ride/Receipt.jsx";
import StatusPill from "../components/ui/StatusPill.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";

const CaptainRiding = () => {
  const { rideId } = useParams();
  const { captain } = useContext(CaptainDataContext);
  const [ride, setRide] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [socket, setSocket] = useState(null);
  const [route, setRoute] = useState([]);
  const [fitSignal, setFitSignal] = useState(0);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cashFallback, setCashFallback] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const otpRef = useRef(null);

  const { position } = useCaptainLocation(socket, true);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/rides/${rideId}`)
      .then(({ data }) => !cancelled && setRide(data.ride))
      .catch((err) => !cancelled && setLoadError(errorMessage(err, "Couldn't load this ride.")));
    return () => {
      cancelled = true;
    };
  }, [rideId]);

  useEffect(() => {
    const s = createSocket("captain");
    setSocket(s);
    const join = () => s.emit("ride:join", { rideId }, () => {});
    s.on("connect", join);
    s.on("ride:started", (p) => setRide((prev) => ({ ...(prev || {}), ...p })));
    s.on("ride:completed", (p) => {
      setRide((prev) => ({ ...(prev || {}), ...p }));
      setReceipt(p.receipt || null);
    });
    s.on("ride:cancelled", (p) => {
      setRide((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
      setError(p.message);
    });
    return () => {
      s.emit("ride:leave", { rideId });
      s.disconnect();
    };
  }, [rideId]);

  const status = ride?.status;
  const pickup = ride ? [ride.pickup.location.lat, ride.pickup.location.lng] : null;
  const destination = ride ? [ride.destination.location.lat, ride.destination.location.lng] : null;
  const captainLatLng = position;

  // Route: me -> pickup while heading there, pickup -> destination once the trip starts.
  const routePhase = status === "accepted" ? "pickup" : status === "in_progress" ? "trip" : "";
  useEffect(() => {
    if (!routePhase || !captainLatLng) return undefined;
    let cancelled = false;
    const to = routePhase === "pickup" ? pickup : destination;
    const from = routePhase === "pickup" ? captainLatLng : pickup;
    fetchRoute(from, to)
      .then((r) => {
        if (!cancelled) {
          setRoute(r.coords);
          setFitSignal((n) => n + 1);
        }
      })
      .catch(() => !cancelled && setRoute([]));
    return () => {
      cancelled = true;
    };
    // Re-route once per phase, not on every GPS tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routePhase, rideId, Boolean(captainLatLng)]);

  const startTrip = async (e) => {
    e?.preventDefault();
    if (otp.length !== 4) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/rides/${rideId}/start`, { otp });
      setRide((prev) => ({ ...prev, ...data.ride }));
      setOtp("");
    } catch (err) {
      setError(errorMessage(err, "Couldn't start the trip."));
      setOtp("");
      otpRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const completeTrip = async (switchToCash = false) => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/rides/${rideId}/complete`, { switchToCash });
      setRide((prev) => ({ ...(prev || {}), ...data.ride, status: "completed" }));
      setReceipt(data.receipt);
      setCashFallback(false);
    } catch (err) {
      if (errorCode(err) === "WALLET_INSUFFICIENT") {
        setCashFallback(true);
        setError("The rider's wallet can't cover this fare. Collect cash instead?");
      } else {
        setError(errorMessage(err, "Couldn't complete the trip."));
      }
    } finally {
      setBusy(false);
    }
  };

  const cancelRide = async () => {
    if (!window.confirm("Cancel this ride? The rider will be notified.")) return;
    setCancelling(true);
    try {
      await api.post(`/rides/${rideId}/cancel`, { reason: "Captain cancelled" });
      setRide((prev) => ({ ...prev, status: "cancelled" }));
    } catch (err) {
      setError(errorMessage(err, "Couldn't cancel."));
    } finally {
      setCancelling(false);
    }
  };

  const riderName = ride?.user?.fullname?.firstname ?? "Rider";
  const vehicleLabel = VEHICLE_META[ride?.vehicleType]?.label ?? "Ride";
  const earning = useMemo(() => (ride ? Math.round(ride.fare * 0.8 * 100) / 100 : 0), [ride]);

  if (loadError) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas p-6 text-center text-ink">
        <div>
          <p className="font-semibold">{loadError}</p>
          <Link to="/captain/home" className="mt-4 inline-block rounded-2xl bg-ink px-5 py-3 font-semibold text-canvas">Back to dashboard</Link>
        </div>
      </div>
    );
  }
  if (!ride) return <div className="grid min-h-screen place-items-center bg-canvas"><div className="dh-skeleton h-40 w-72" /></div>;

  const target = status === "accepted" ? pickup : destination;
  const mapsLink = target ? directionsUrl(target[0], target[1]) : null;
  const canChat = ["accepted", "in_progress"].includes(status);

  return (
    <div className="fixed inset-0 overflow-hidden bg-canvas">
      <RideMap
        pickup={pickup}
        destination={destination}
        userPos={null}
        captain={captainLatLng ? { lat: captainLatLng[0], lng: captainLatLng[1], vehicleType: captain?.vehicle?.vehicleType } : null}
        route={route}
        fitSignal={fitSignal}
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-4">
        <Link to="/captain/home" aria-label="Back to dashboard" className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-line bg-surface shadow-card">
          <i className="ri-arrow-left-line text-lg" />
        </Link>
        <div className="pointer-events-auto rounded-full border border-line bg-surface px-3 py-2 shadow-card">
          <StatusPill status={status} label={status === "accepted" ? "Heading to pickup" : undefined} />
        </div>
        <ThemeToggle className="pointer-events-auto" />
      </header>

      <div className="absolute right-4 top-[40%] z-10">
        <RecenterButton onClick={() => setFitSignal((n) => n + 1)} />
      </div>

      <motion.section
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        className="absolute inset-x-0 bottom-0 z-10 max-h-[64%] overflow-y-auto rounded-t-[1.75rem] border-t border-line bg-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-card dh-no-scrollbar"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-surface-3" />

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-ink-3">{vehicleLabel} · {ride.distance?.toFixed?.(1) ?? ride.distance} km</p>
            <h2 className="truncate text-lg font-bold">{riderName}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-3">You earn</p>
            <p className="text-lg font-bold text-success">{inr(earning)}</p>
          </div>
        </div>

        {status === "accepted" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-surface-2 p-4 text-sm">
              <p className="flex gap-3"><i className="ri-record-circle-line mt-0.5 text-success" /><span>{ride.pickup.address}</span></p>
            </div>
            <form onSubmit={startTrip} className="space-y-3">
              <label className="block text-sm font-semibold">
                Enter the rider's 4-digit code
                <input
                  ref={otpRef}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="0000"
                  className="mt-2 w-full rounded-2xl border border-line bg-surface-2 py-4 text-center font-mono text-3xl tracking-[0.6em] text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/20"
                />
              </label>
              <button type="submit" disabled={otp.length !== 4 || busy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-success py-4 font-bold text-white transition active:scale-[0.98] disabled:opacity-40">
                {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                Start trip
              </button>
            </form>
            <div className="grid grid-cols-2 gap-2.5">
              <a href={mapsLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-surface-2 py-3 text-sm font-semibold">
                <i className="ri-navigation-line" /> Navigate
              </a>
              <button type="button" onClick={cancelRide} disabled={cancelling} className="rounded-2xl border border-danger/40 py-3 text-sm font-semibold text-danger disabled:opacity-50">
                {cancelling ? "Cancelling..." : "Cancel ride"}
              </button>
            </div>
          </div>
        )}

        {status === "in_progress" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-surface-2 p-4 text-sm">
              <p className="flex gap-3"><i className="ri-map-pin-fill mt-0.5 text-danger" /><span>{ride.destination.address}</span></p>
            </div>
            <a href={mapsLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-surface-2 py-3 text-sm font-semibold">
              <i className="ri-navigation-line" /> Navigate to destination
            </a>
            <div className="rounded-2xl bg-surface-2 p-4 text-sm">
              <p className="text-ink-2">Payment</p>
              <p className="font-semibold">{inr(ride.fare)} · {ride.paymentMethod === "wallet" ? "Wallet" : "Cash"}</p>
            </div>
            {cashFallback && (
              <button type="button" onClick={() => completeTrip(true)} disabled={busy} className="w-full rounded-2xl bg-brand py-4 font-bold text-brand-ink disabled:opacity-50">
                Collect {inr(ride.fare)} in cash
              </button>
            )}
            {!cashFallback && (
              <button type="button" onClick={() => completeTrip(false)} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-success py-4 font-bold text-white transition active:scale-[0.98] disabled:opacity-60">
                {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                Complete ride
              </button>
            )}
          </div>
        )}

        {status === "completed" && (
          <div className="space-y-4 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
              <i className="ri-check-line text-3xl" />
            </span>
            <h2 className="text-xl font-bold">Trip complete</h2>
            <Receipt receipt={receipt || { fare: ride.finalFare ?? ride.fare, commission: 0, captainShare: earning, paymentMethod: ride.paymentMethod }} perspective="captain" />
            <Link to="/captain/home" className="block rounded-2xl bg-ink py-3.5 font-semibold text-canvas">Back to dashboard</Link>
          </div>
        )}

        {status === "cancelled" && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold">Ride cancelled</h2>
            <p className="text-sm text-ink-2">{ride.cancelReason || error || "This ride is no longer active."}</p>
            <Link to="/captain/home" className="block rounded-2xl bg-ink py-3.5 font-semibold text-canvas">Back to dashboard</Link>
          </div>
        )}

        {error && status !== "completed" && <p className="mt-4 rounded-xl bg-danger/10 p-3 text-center text-sm text-danger">{error}</p>}

        {canChat && (
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-line py-3 font-semibold text-ink"
          >
            <i className="ri-chat-3-line" /> Message {riderName}
            {unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">{unread}</span>}
          </button>
        )}
      </motion.section>

      {canChat && (
        <ChatPanel
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          rideId={rideId}
          socket={socket}
          selfRole="captain"
          otherName={riderName}
          onUnreadChange={setUnread}
        />
      )}
    </div>
  );
};

export default CaptainRiding;
