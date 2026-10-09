import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="grid min-h-screen place-items-center bg-canvas p-6 text-center text-ink">
    <div>
      <p className="text-6xl font-extrabold text-brand-strong">404</p>
      <h1 className="mt-2 text-xl font-semibold">We couldn't find that page</h1>
      <Link to="/" className="mt-6 inline-block rounded-2xl bg-ink px-6 py-3 font-semibold text-canvas">
        Back to Dhanno
      </Link>
    </div>
  </div>
);

export default NotFound;
