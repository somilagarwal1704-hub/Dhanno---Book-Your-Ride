import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext.jsx";
import { api, errorMessage } from "../lib/api.js";
import AuthLayout, { FormError } from "../components/ui/AuthLayout.jsx";
import Field from "../components/ui/Field.jsx";
import Button from "../components/ui/Button.jsx";

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(UserDataContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/users/login", { email, password });
      setUser(data.user);
      navigate(location.state?.from || "/home", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't sign you in."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to book your next ride."
      footer={
        <>
          <p>
            New to Dhanno?{" "}
            <Link to="/user/signup" className="font-semibold text-ink underline underline-offset-4">
              Create an account
            </Link>
          </p>
          <Link to="/captain/login" className="inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-3 font-medium text-ink transition hover:bg-surface-2">
            <i className="ri-steering-2-line" /> Drive with Dhanno instead
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <Field label="Email" type="email" icon="ri-mail-line" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <div>
          <Field
            label="Password"
            type={showPassword ? "text" : "password"}
            icon="ri-lock-2-line"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          <button type="button" onClick={() => setShowPassword((s) => !s)} className="mt-2 text-xs font-medium text-ink-2 underline underline-offset-4">
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>
        <Button type="submit" variant="dark" loading={loading} className="mt-2">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
};

export default UserLogin;
