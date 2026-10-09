import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext.jsx";
import { api } from "../lib/api.js";
import PageLoader from "../components/ui/PageLoader.jsx";

/** Verifies the captain's session cookie before rendering children. */
const CaptainProtectedComponent = ({ children }) => {
  const navigate = useNavigate();
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const [ready, setReady] = useState(Boolean(captain?._id));

  useEffect(() => {
    let cancelled = false;
    api
      .get("/captains/profile")
      .then(({ data }) => {
        if (cancelled) return;
        setCaptain(data.captain);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) navigate("/captain/login", { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, setCaptain]);

  if (!ready) return <PageLoader label="Checking your session..." />;
  return children;
};

export default CaptainProtectedComponent;
