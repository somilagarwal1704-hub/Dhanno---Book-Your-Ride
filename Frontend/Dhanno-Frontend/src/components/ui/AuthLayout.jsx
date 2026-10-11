import { Link } from "react-router-dom";
import logo from "../../assets/logo4.png";
import { DARK_VARS } from "../../lib/darkVars.js";

const AuthLayout = ({ title, subtitle, children, footer, accent = "brand" }) => (
  <div className="relative min-h-screen bg-canvas text-ink" style={{ ...DARK_VARS, backgroundColor: DARK_VARS["--canvas"] }}>
    <div className={`pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b ${accent === "brand" ? "from-brand/20" : "from-success/20"} to-transparent`} />
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-8 pt-6">
      <div className="flex items-center justify-between">
        <Link to="/" aria-label="Dhanno home">
          <img src={logo} alt="Dhanno" className="h-10 w-auto brightness-0 invert" />
        </Link>
      </div>

      <div className="mt-10">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-ink-2">{subtitle}</p>}
      </div>

      <div className="mt-8 flex-1">{children}</div>

      {footer && <div className="mt-8 space-y-3 text-center text-sm text-ink-2">{footer}</div>}
    </div>
  </div>
);

export const FormError = ({ message }) =>
  message ? (
    <p role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      {message}
    </p>
  ) : null;

export default AuthLayout;
