import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

const AppBar = ({ title, subtitle, backTo, right, showThemeToggle = true }) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur-md">
      {backTo !== undefined && (
        <button
          type="button"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          aria-label="Go back"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-ink transition active:scale-95"
        >
          <i className="ri-arrow-left-line text-xl" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>
        {subtitle && <p className="truncate text-xs text-ink-2">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {right}
        {showThemeToggle && <ThemeToggle />}
      </div>
    </header>
  );
};

export const BrandLink = ({ to = "/" }) => (
  <Link to={to} className="text-base font-bold tracking-tight text-ink">
    Dhanno<span className="text-brand-strong">.</span>
  </Link>
);

export default AppBar;
