import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../../lib/api.js";

/** Debounced place search. `onPick` receives { label, lat, lng }. */
const LocationSearch = ({ query, onPick, onUseCurrent, canUseCurrent, near }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const text = query?.trim() ?? "";
    if (text.length < 3) {
      setResults([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/maps/suggestions", {
          params: { input: text, lat: near?.[0], lng: near?.[1] },
        });
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, near?.[0], near?.[1]]);

  const showCurrent = canUseCurrent && onUseCurrent;

  return (
    <div className="dh-no-scrollbar max-h-64 overflow-y-auto">
      {showCurrent && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onUseCurrent}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-surface-2"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-info/15 text-info">
            <i className="ri-crosshair-2-line" />
          </span>
          <span className="text-sm font-medium text-ink">Use my current location</span>
        </button>
      )}

      {loading && (
        <div className="space-y-2 px-3 py-2">
          {[0, 1].map((i) => (
            <div key={i} className="dh-skeleton h-10" />
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        {results.map((place, i) => (
          <motion.button
            key={`${place.displayName}-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: i * 0.03 }}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              onPick({
                label: place.displayName,
                lat: Number(place.latitude),
                lng: Number(place.longitude),
              })
            }
            className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-surface-2"
          >
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-2">
              <i className="ri-map-pin-line" />
            </span>
            <span className="min-w-0 text-sm leading-snug text-ink">{place.displayName}</span>
          </motion.button>
        ))}
      </AnimatePresence>

      {!loading && query?.trim().length >= 3 && results.length === 0 && (
        <p className="px-3 py-4 text-sm text-ink-3">No places found. Try a nearby landmark.</p>
      )}
    </div>
  );
};

export default LocationSearch;
