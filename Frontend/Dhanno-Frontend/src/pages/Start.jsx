import { Link } from "react-router-dom";
import { motion } from "motion/react";
import logo from "../assets/logo4.png";
import RideIllustration from "../components/ui/RideIllustration.jsx";

const FEATURES = [
  { icon: "ri-route-line", title: "Live map", text: "Track your captain on the map in real time." },
  { icon: "ri-chat-3-line", title: "Trip chat", text: "Message your captain privately during the trip." },
  { icon: "ri-wallet-3-line", title: "Wallet & receipts", text: "Pay from your wallet or in cash, with a clear receipt." },
  { icon: "ri-price-tag-3-line", title: "Upfront fares", text: "See every fare before you book." },
];

const Start = () => (
  <div className="theme-dark relative min-h-screen overflow-hidden bg-canvas text-ink">
    {/* soft background glows so the page never looks like a flat black sheet */}
    <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
    <div className="pointer-events-none absolute -right-32 top-96 h-96 w-96 rounded-full bg-success/10 blur-3xl" />

    <div className="relative mx-auto flex w-full max-w-3xl flex-col px-6 pb-12 pt-8">
      <header className="flex items-center justify-between">
        <img src={logo} alt="Dhanno" className="h-10 w-auto brightness-0 invert" />
        <span className="rounded-full border border-line bg-surface/70 px-3 py-1 text-xs text-ink-2">India</span>
      </header>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Ride, your way</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Get where you're going with <span className="text-brand">Dhanno</span>.
        </h1>
        <p className="mt-4 max-w-md text-ink-2">
          Book a ride in a few taps, or drive and keep 80% of every fare.
        </p>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-8 rounded-[1.5rem] border border-line bg-surface p-4 shadow-card">
        <RideIllustration />
        <div className="mt-5 flex flex-col gap-3">
          <Link
            to="/user/login"
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-bold text-brand-ink transition hover:brightness-105 active:scale-[0.98]"
          >
            <i className="ri-user-smile-line" /> Login as Rider
          </Link>
          <Link
            to="/captain/login"
            className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 py-4 text-base font-semibold text-ink transition hover:bg-surface-3 active:scale-[0.98]"
          >
            <i className="ri-steering-2-line" /> Login as Captain
          </Link>
        </div>
      </motion.section>

      <p className="mt-5 text-center text-sm text-ink-3">
        New here?{" "}
        <Link to="/user/signup" className="font-semibold text-ink underline underline-offset-4">Sign up as rider</Link>
        {" · "}
        <Link to="/captain/signup" className="font-semibold text-ink underline underline-offset-4">Register as captain</Link>
      </p>

      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-line bg-surface p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/15 text-brand">
              <i className={`${f.icon} text-lg`} />
            </span>
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-ink-2">{f.text}</p>
          </div>
        ))}
      </section>

      <p className="mt-12 text-center text-xs text-ink-3">© {new Date().getFullYear()} Dhanno</p>
    </div>
  </div>
);

export default Start;
