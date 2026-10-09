import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { UserDataContext } from "../context/UserContext.jsx";
import { api, errorMessage, errorCode } from "../lib/api.js";
import { createSocket } from "../lib/socket.js";
import { fetchRoute, inr } from "../lib/format.js";
import RideMap, { RecenterButton } from "../components/map/RideMap.jsx";
import LocationSearch from "../components/rider/LocationSearch.jsx";
import VehiclePicker from "../components/rider/VehiclePicker.jsx";
import BookingConfirm from "../components/rider/BookingConfirm.jsx";
import Searching from "../components/rider/Searching.jsx";
import Sheet from "../components/ui/Sheet.jsx";
import logo from "../assets/logo4.png";

const NEARBY_POLL_MS = 8000;

const placeFromCoords = (lat, lng, label) => ({ label, lat, lng });

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserDataContext);
  const walletBalance = user?.wallet?.balance ?? 0;

  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [pickupText, setPickupText] = useState("");
  const [destText, setDestText] = useState("");
  const [focused, setFocused] = useState(null);

  const [userPos, setUserPos] = useState(null);
  const [route, setRoute] = useState([]);
  const [trip, setTrip] = useState(null); // { distanceKm, durationMin }
  const [routeError, setRouteError] = useState("");

  const [estimate, setEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [step, setStep] = useState("search"); // search | vehicles | confirm | searching
  const [booking, setBooking] = useState({ loading: false, error: "" });
  const [ride, setRide] = useState(null); // { _id, ... } while searching
  const [searchMsg, setSearchMsg] = useState("Contacting nearby captains...");
  const [searchFailed, setSearchFailed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [nearby, setNearby] = useState([]);
  const [fitSignal, setFitSignal] = useState(0);

  const socketRef = useRef(null);
  const rideIdRef = useRef(null);
  useEffect(() => {
    rideIdRef.current = ride?._id ?? null;
  }, [ride]);

  // Current location, pre-filled as pickup when the rider hasn't chosen one.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const here = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(here);
        setFitSignal((n) => n + 1);
        try {
          const { data } = await api.get("/maps/reverse", { params: { lat: here[0], lng: here[1] } });
          setPickup((current) => current ?? placeFromCoords(here[0], here[1], data.displayName));
          setPickupText((t) => t || data.displayName);
        } catch {
          setPickup((current) => current ?? placeFromCoords(here[0], here[1], "Current location"));
          setPickupText((t) => t || "Current location");
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // Restore an in-progress ride after refresh, or jump straight into it.
  useEffect(() => {
    api
      .get("/rides/active")
      .then(({ data }) => {
        const active = data.ride;
        if (!active) return;
        if (active.status === "pending") {
          setRide(active);
          setStep("searching");
          setSearchMsg("Still looking for a captain...");
        } else {
          navigate(`/riding/${active._id}`, { replace: true });
        }
      })
      .catch(() => {});
  }, [navigate]);

  // Real-time: offers progress, acceptance, and no-captain outcomes.
  useEffect(() => {
    const socket = createSocket("user");
    socketRef.current = socket;

    // Events carry the ride as `rideId` (lifecycle pushes) or `_id` (full ride view).
    const rideOf = (payload) => String(payload?.rideId ?? payload?._id ?? "");
    const isMine = (payload) => Boolean(rideIdRef.current) && rideOf(payload) === rideIdRef.current;

    socket.on("ride:searching", (p) => {
      if (isMine(p)) setSearchMsg(p.message);
    });
    socket.on("ride:accepted", (p) => {
      if (isMine(p)) navigate(`/riding/${rideOf(p)}`);
    });
    socket.on("ride:no-captain", (p) => {
      if (!isMine(p)) return;
      setSearchFailed(true);
      setSearchMsg(p.message);
    });
    socket.on("ride:cancelled", (p) => {
      if (!isMine(p)) return;
      setRide(null);
      setStep("vehicles");
    });

    return () => socket.disconnect();
  }, [navigate]);

  // Build the road route whenever both points are set.
  useEffect(() => {
    if (!pickup || !destination) {
      setRoute([]);
      setTrip(null);
      return undefined;
    }
    let cancelled = false;
    setRouteError("");
    fetchRoute([pickup.lat, pickup.lng], [destination.lat, destination.lng])
      .then((r) => {
        if (cancelled) return;
        setRoute(r.coords);
        setTrip({ distanceKm: r.distanceKm, durationMin: r.durationMin });
        setFitSignal((n) => n + 1);
        setStep((s) => (s === "search" ? "vehicles" : s));
      })
      .catch(() => {
        if (cancelled) return;
        setRoute([]);
        setTrip(null);
        setRouteError("We couldn't find a driving route between these points. Try a nearby address.");
      });
    return () => {
      cancelled = true;
    };
  }, [pickup, destination]);

  // Fare quotes and pickup supply.
  useEffect(() => {
    if (!trip || !pickup) return undefined;
    let cancelled = false;
    setEstimating(true);
    api
      .get("/rides/estimate", {
        params: {
          distance: trip.distanceKm.toFixed(3),
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
        },
      })
      .then(({ data }) => !cancelled && setEstimate(data))
      .catch(() => !cancelled && setEstimate(null))
      .finally(() => !cancelled && setEstimating(false));
    return () => {
      cancelled = true;
    };
  }, [trip, pickup]);

  // Keep nearby captains fresh while the rider is still choosing.
  const nearbyAnchor = pickup ? [pickup.lat, pickup.lng] : userPos;
  useEffect(() => {
    if (!nearbyAnchor || (step !== "search" && step !== "vehicles")) return undefined;
    const load = () =>
      api
        .get("/captains/nearby", { params: { lat: nearbyAnchor[0], lng: nearbyAnchor[1] } })
        .then(({ data }) => setNearby(data.captains))
        .catch(() => {});
    load();
    const id = setInterval(load, NEARBY_POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearbyAnchor?.[0], nearbyAnchor?.[1], step]);

  const pickPlace = (which) => (place) => {
    if (which === "pickup") {
      setPickup(place);
      setPickupText(place.label);
    } else {
      setDestination(place);
      setDestText(place.label);
    }
    setFocused(null);
  };

  const useCurrentAsPickup = () => {
    if (!userPos) return;
    setPickup(placeFromCoords(userPos[0], userPos[1], "Current location"));
    setPickupText("Current location");
    setFocused(null);
  };

  const onFocus = (field) => {
    setFocused(field);
    if (step === "vehicles" || step === "confirm") setStep("search");
  };

  const openConfirm = (type) => {
    setVehicle(type);
    const fare = estimate?.vehicles?.[type]?.fare ?? 0;
    setPaymentMethod(walletBalance >= fare && fare > 0 ? "wallet" : "cash");
    setBooking({ loading: false, error: "" });
    setStep("confirm");
  };

  const bookRide = async () => {
    if (!pickup || !destination || !trip || !vehicle) return;
    setBooking({ loading: true, error: "" });
    try {
      const { data } = await api.post("/rides/create", {
        pickup: { address: pickup.label, location: { lat: pickup.lat, lng: pickup.lng } },
        destination: { address: destination.label, location: { lat: destination.lat, lng: destination.lng } },
        vehicleType: vehicle,
        distance: trip.distanceKm,
        duration: trip.durationMin,
        paymentMethod,
      });
      setRide(data);
      setSearchFailed(false);
      setSearchMsg("Contacting nearby captains...");
      setStep("searching");
      setBooking({ loading: false, error: "" });
    } catch (err) {
      setBooking({
        loading: false,
        error:
          errorCode(err) === "WALLET_INSUFFICIENT"
            ? errorMessage(err)
            : errorMessage(err, "Couldn't book this ride. Please try again."),
      });
    }
  };

  const cancelRide = async () => {
    if (!ride?._id) {
      setStep("vehicles");
      return;
    }
    try {
      await api.post(`/rides/${ride._id}/cancel`, { reason: "Changed my mind" });
    } catch (err) {
      setSearchMsg(errorMessage(err, "Couldn't cancel. Try again."));
      return;
    }
    setRide(null);
    setSearchFailed(false);
    setStep("vehicles");
  };

  const retry = async () => {
    if (!ride?._id) return;
    setRetrying(true);
    try {
      const { data } = await api.post(`/rides/${ride._id}/retry`);
      setRide(data.ride);
      setSearchFailed(false);
      setSearchMsg("Trying again with nearby captains...");
    } catch (err) {
      setSearchFailed(true);
      setSearchMsg(errorMessage(err, "Couldn't retry right now."));
    } finally {
      setRetrying(false);
    }
  };

  const fares = estimate?.vehicles;
  const selectedFare = vehicle ? fares?.[vehicle]?.fare : 0;
  const mapPickup = pickup ? [pickup.lat, pickup.lng] : null;
  const mapDestination = destination ? [destination.lat, destination.lng] : null;
  const nearbyCount = nearby.length;
  const searchingOpen = step === "searching";
  const searchCardVisible = !searchingOpen;

  const headerText = useMemo(() => {
    if (step === "search" && !pickup) return "Where are you?";
    return null;
  }, [step, pickup]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-canvas">
      <div className="absolute inset-0">
        <RideMap
          pickup={mapPickup}
          destination={mapDestination}
          userPos={userPos}
          route={route}
          nearby={nearby}
          fitSignal={fitSignal}
        />
      </div>

      {/* Floating search card */}
      <AnimatePresence>
        {searchCardVisible && (
          <motion.div
            key="search-card"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 top-0 z-20 p-4"
          >
            <div className="pointer-events-auto mx-auto max-w-xl rounded-[1.5rem] border border-line bg-surface/95 p-4 shadow-card backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={logo} alt="Dhanno" className="h-9 w-auto" />
                  {headerText && <span className="text-sm font-semibold text-ink-2">{headerText}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/wallet" className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-2 text-xs font-semibold text-ink transition active:scale-95" aria-label="Wallet">
                    <i className="ri-wallet-3-line" /> {inr(walletBalance)}
                  </Link>
                  <Link to="/activity" aria-label="Ride activity" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-ink transition active:scale-95">
                    <i className="ri-history-line" />
                  </Link>
                  <Link to="/user/logout" aria-label="Log out" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-ink transition active:scale-95">
                    <i className="ri-logout-box-r-line" />
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-[21px] top-[30px] bottom-[30px] w-0.5 rounded-full bg-ink-3/50" />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-success ring-4 ring-success/20" />
                  <input
                    aria-label="Pickup location"
                    onFocus={() => onFocus("pickup")}
                    onBlur={() => setTimeout(() => setFocused((f) => (f === "pickup" ? null : f)), 150)}
                    value={pickupText}
                    onChange={(e) => {
                      setPickupText(e.target.value);
                      setPickup(null);
                      setFocused("pickup");
                    }}
                    placeholder="Pickup location"
                    className="w-full rounded-2xl bg-surface-2 py-3.5 pl-11 pr-4 text-[15px] text-ink outline-none ring-brand transition placeholder:text-ink-3 focus:ring-2"
                  />
                </div>
                <div className="relative mt-2.5">
                  <i className="ri-map-pin-fill absolute left-3.5 top-1/2 -translate-y-1/2 text-danger" />
                  <input
                    aria-label="Destination"
                    onFocus={() => onFocus("destination")}
                    onBlur={() => setTimeout(() => setFocused((f) => (f === "destination" ? null : f)), 150)}
                    value={destText}
                    onChange={(e) => {
                      setDestText(e.target.value);
                      setDestination(null);
                      setFocused("destination");
                    }}
                    placeholder="Where to?"
                    className="w-full rounded-2xl bg-surface-2 py-3.5 pl-11 pr-4 text-[15px] text-ink outline-none ring-brand transition placeholder:text-ink-3 focus:ring-2"
                  />
                </div>
              </div>

              {routeError && <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{routeError}</p>}

              <AnimatePresence initial={false}>
                {focused && (
                  <motion.div key="suggestions" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 border-t border-line pt-2">
                      <LocationSearch
                        query={focused === "pickup" ? pickupText : destText}
                        near={focused === "pickup" ? userPos : pickup ? [pickup.lat, pickup.lng] : userPos}
                        onPick={pickPlace(focused)}
                        canUseCurrent={focused === "pickup" && Boolean(userPos)}
                        onUseCurrent={useCurrentAsPickup}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!searchingOpen && (
        <RecenterButton
          className="absolute right-4 top-[46%] z-10"
          onClick={() => setFitSignal((n) => n + 1)}
        />
      )}

      {/* Bottom sheets, one per step */}
      <Sheet open={step === "search" && !focused} label="Find a ride">
        <div className="pb-2 text-center">
          <h2 className="text-lg font-bold text-ink">Where to today?</h2>
          <p className="mt-1 text-sm text-ink-2">
            {nearbyCount > 0
              ? `${nearbyCount} captain${nearbyCount > 1 ? "s" : ""} nearby right now`
              : "Set a pickup and destination to see fares."}
          </p>
        </div>
      </Sheet>

      <Sheet open={step === "vehicles"} label="Choose a ride">
        <VehiclePicker
          estimate={estimate}
          loading={estimating}
          distanceKm={trip?.distanceKm ?? 0}
          durationMin={trip?.durationMin ?? 0}
          selected={vehicle}
          onSelect={setVehicle}
          onContinue={() => vehicle && openConfirm(vehicle)}
        />
      </Sheet>

      <Sheet open={step === "confirm"} label="Confirm ride">
        {vehicle && pickup && destination && trip && (
          <BookingConfirm
            vehicle={vehicle}
            fare={selectedFare}
            distanceKm={trip.distanceKm}
            durationMin={trip.durationMin}
            pickup={pickup}
            destination={destination}
            paymentMethod={paymentMethod}
            onPaymentChange={setPaymentMethod}
            walletBalance={walletBalance}
            onConfirm={bookRide}
            onBack={() => setStep("vehicles")}
            loading={booking.loading}
            error={booking.error}
          />
        )}
      </Sheet>

      <Sheet open={searchingOpen} label="Finding captain">
        <Searching
          message={searchMsg}
          failed={searchFailed}
          retrying={retrying}
          onCancel={cancelRide}
          onRetry={retry}
          vehicleLabel={vehicle ? `${vehicle === "bike" ? "Bike" : vehicle === "auto" ? "Auto" : "Cab"}` : ""}
          fare={selectedFare || undefined}
        />
      </Sheet>
    </div>
  );
};

export default Home;
