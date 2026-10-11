import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext.jsx";
import { api } from "../lib/api.js";
import { clearToken } from "../lib/session.js";
import PageLoader from "../components/ui/PageLoader.jsx";

const UserLogout = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  useEffect(() => {
    // The session lives in an HttpOnly cookie, so the server must clear it.
    api.post("/users/logout").finally(() => {
      clearToken("user");
      setUser(null);
      navigate("/user/login", { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <PageLoader label="Signing you out..." />;
};

export default UserLogout;
