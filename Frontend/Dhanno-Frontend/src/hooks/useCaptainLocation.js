import { useEffect, useRef, useState } from "react";

/**
 * Streams the captain's GPS to the server over the socket (at most every 3s).
 * Returns the latest [lat, lng] fix so the UI can draw the captain on the map.
 */
export const useCaptainLocation = (socket, enabled = true) => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");
  const lastSent = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;
    if (!navigator.geolocation) {
      setError("This device can't share location.");
      return undefined;
    }
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const here = [coords.latitude, coords.longitude];
        setPosition(here);
        setError("");
        const now = Date.now();
        if (socket?.connected && now - lastSent.current >= 3000) {
          lastSent.current = now;
          socket.emit("captain:location", { lat: here[0], lng: here[1] });
        }
      },
      (err) => setError(err.code === 1 ? "Location permission is off. Enable it to receive rides." : "Waiting for GPS signal..."),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket, enabled]);

  return { position, error };
};
