import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext.jsx";
import { api } from "../lib/api.js";
import { clearToken } from "../lib/session.js";
import PageLoader from "../components/ui/PageLoader.jsx";

const CaptainLogout = () => {
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);

  useEffect(() => {
    api.post("/captains/logout").finally(() => {
      clearToken("captain");
      setCaptain(null);
      navigate("/captain/login", { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <PageLoader label="Signing you out..." />;
};

export default CaptainLogout;
