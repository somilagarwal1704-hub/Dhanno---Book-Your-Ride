import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext.jsx";
import { api, errorMessage } from "../lib/api.js";
import AuthLayout, { FormError } from "../components/ui/AuthLayout.jsx";
import Field from "../components/ui/Field.jsx";
import Button from "../components/ui/Button.jsx";

const UserSignup = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/users/register", {
        fullname: { firstname: form.firstname.trim(), lastname: form.lastname.trim() },
        email: form.email.trim(),
        password: form.password,
      });
      setUser(data.user);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't create your account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Ride in minutes. Pay your way."
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/user/login" className="font-semibold text-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" required minLength={3} value={form.firstname} onChange={update("firstname")} placeholder="Somil" />
          <Field label="Last name" minLength={3} value={form.lastname} onChange={update("lastname")} placeholder="Optional" />
        </div>
        <Field label="Email" type="email" icon="ri-mail-line" required value={form.email} onChange={update("email")} placeholder="you@example.com" />
        <Field label="Password" type="password" icon="ri-lock-2-line" required minLength={6} value={form.password} onChange={update("password")} hint="Use at least 6 characters." />
        <Button type="submit" variant="dark" loading={loading} className="mt-2">
          Create account
        </Button>
        <p className="text-center text-xs text-ink-3">
          By continuing you agree to Dhanno's terms and privacy policy.
        </p>
      </form>
    </AuthLayout>
  );
};

export default UserSignup;
