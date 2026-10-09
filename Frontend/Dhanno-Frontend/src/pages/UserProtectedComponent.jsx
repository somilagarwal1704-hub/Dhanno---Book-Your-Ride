import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext.jsx";
import { api } from "../lib/api.js";
import PageLoader from "../components/ui/PageLoader.jsx";

/** Verifies the rider's session cookie before rendering children. */
const UserProtectedComponent = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(UserDataContext);
  const [ready, setReady] = useState(Boolean(user?._id));

  useEffect(() => {
    let cancelled = false;
    api
      .get("/users/profile")
      .then(({ data }) => {
        if (cancelled) return;
        setUser(data.user);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) navigate("/user/login", { replace: true, state: { from: location.pathname } });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, setUser]);

  if (!ready) return <PageLoader label="Checking your session..." />;
  return children;
};

export default UserProtectedComponent;
