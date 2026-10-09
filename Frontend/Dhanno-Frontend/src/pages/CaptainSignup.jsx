import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext.jsx";
import { api, errorMessage } from "../lib/api.js";
import AuthLayout, { FormError } from "../components/ui/AuthLayout.jsx";
import Field from "../components/ui/Field.jsx";
import Button from "../components/ui/Button.jsx";
import { VEHICLE_META } from "../lib/format.js";

const CaptainSignup = () => {
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    color: "",
    plate: "",
    capacity: "4",
    vehicleType: "car",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/captains/register", {
        fullname: { firstname: form.firstname.trim(), lastname: form.lastname.trim() },
        email: form.email.trim(),
        password: form.password,
        vehicle: {
          color: form.color.trim(),
          plate: form.plate.trim().toUpperCase(),
          capacity: Number(form.capacity),
          vehicleType: form.vehicleType,
        },
      });
      setCaptain(data.captain);
      navigate("/captain/home", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't register your account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      accent="success"
      title="Become a captain"
      subtitle="Set your own hours. Keep 80% of every fare."
      footer={
        <p>
          Already registered?{" "}
          <Link to="/captain/login" className="font-semibold text-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" required minLength={3} value={form.firstname} onChange={update("firstname")} />
          <Field label="Last name" minLength={3} value={form.lastname} onChange={update("lastname")} />
        </div>
        <Field label="Email" type="email" icon="ri-mail-line" required value={form.email} onChange={update("email")} />
        <Field label="Password" type="password" icon="ri-lock-2-line" required minLength={6} value={form.password} onChange={update("password")} />

        <p className="pt-2 text-sm font-semibold text-ink">Your vehicle</p>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Vehicle type">
          {Object.keys(VEHICLE_META).map((type) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={form.vehicleType === type}
              onClick={() => setForm((f) => ({ ...f, vehicleType: type }))}
              className={`rounded-2xl border-2 py-3 text-sm font-semibold transition ${
                form.vehicleType === type ? "border-success bg-success/10 text-ink" : "border-line bg-surface-2 text-ink-2"
              }`}
            >
              {VEHICLE_META[type].label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Colour" required minLength={3} value={form.color} onChange={update("color")} placeholder="White" />
          <Field label="Number plate" required minLength={3} value={form.plate} onChange={update("plate")} placeholder="UP38 AB 1234" />
        </div>
        <Field label="Seats" type="number" min={1} max={8} required value={form.capacity} onChange={update("capacity")} />
        <Button type="submit" variant="success" loading={loading} className="mt-2">
          Create captain account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default CaptainSignup;
