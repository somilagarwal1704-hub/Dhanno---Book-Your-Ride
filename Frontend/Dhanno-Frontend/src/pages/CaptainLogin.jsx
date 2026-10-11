import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext.jsx";
import { api, errorMessage } from "../lib/api.js";
import { saveToken, clearToken } from "../lib/session.js";
import AuthLayout, { FormError } from "../components/ui/AuthLayout.jsx";
import Field from "../components/ui/Field.jsx";
import Button from "../components/ui/Button.jsx";

const CaptainLogin = () => {
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/captains/login", { email, password });
      saveToken("captain", data.token);
      setCaptain(data.captain);
      navigate("/captain/home", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't sign you in."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      accent="success"
      title="Captain sign in"
      subtitle="Go online, accept rides, and get paid."
      footer={
        <>
          <p>
            Want to join the fleet?{" "}
            <Link to="/captain/signup" className="font-semibold text-ink underline underline-offset-4">
              Register your vehicle
            </Link>
          </p>
          <Link to="/user/login" className="inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-3 font-medium text-ink transition hover:bg-surface-2">
            <i className="ri-user-line" /> Ride with Dhanno instead
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <Field label="Email" type="email" icon="ri-mail-line" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="captain@example.com" />
        <Field label="Password" type="password" icon="ri-lock-2-line" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="success" loading={loading} className="mt-2">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
};

export default CaptainLogin;
