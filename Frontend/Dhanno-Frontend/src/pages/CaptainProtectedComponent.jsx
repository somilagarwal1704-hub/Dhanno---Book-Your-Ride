import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext.jsx";
import { api } from "../lib/api.js";
import { clearToken } from "../lib/session.js";
import PageLoader from "../components/ui/PageLoader.jsx";

/**
 * Verifies the captain's session before rendering children.
 * Only a 401 (token rejected) signs the captain out. Network errors and a sleeping
 * server are retried, so a slow wake-up never looks like a logout.
 */
const CaptainProtectedComponent = ({ children }) => {
  const navigate = useNavigate();
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const [ready, setReady] = useState(Boolean(captain?._id));
  const [status, setStatus] = useState(captain?._id ? "ok" : "checking");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer;
    let tries = 0;

    const check = () => {
      api
        .get("/captains/profile")
        .then(({ data }) => {
          if (cancelled) return;
          setCaptain(data.captain);
          setReady(true);
          setStatus("ok");
        })
        .catch((err) => {
          if (cancelled) return;
          if (err.response?.status === 401) {
            clearToken("captain");
            navigate("/captain/login", { replace: true });
            return;
          }
          tries += 1;
          if (tries < 8) {
            setStatus("waking");
            timer = setTimeout(check, 4000);
          } else {
            setStatus("offline");
          }
        });
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  if (status === "offline") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center text-ink">
        <p className="text-lg font-semibold">Can't reach the Dhanno server right now.</p>
        <p className="max-w-sm text-sm text-ink-2">Your login is still saved. The server may be waking up, so please try again.</p>
        <button type="button" onClick={() => { setStatus("checking"); setNonce((n) => n + 1); }} className="rounded-2xl bg-success px-5 py-3 font-semibold text-white">Try again</button>
      </div>
    );
  }

  if (!ready) {
    return <PageLoader label={status === "waking" ? "Waking up the Dhanno server, this can take a minute..." : "Checking your session..."} />;
  }
  return children;
};

export default CaptainProtectedComponent;
