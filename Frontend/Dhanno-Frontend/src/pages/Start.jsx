import { Link } from "react-router-dom";
import { motion } from "motion/react";
import logo from "../assets/logo4.png";

const FEATURES = [
  { icon: "ri-route-line", title: "Live map", text: "Track your captain on the map in real time." },
  { icon: "ri-chat-3-line", title: "Trip chat", text: "Message your captain privately during the trip." },
  { icon: "ri-wallet-3-line", title: "Wallet & receipts", text: "Pay from your wallet or in cash, with a clear receipt." },
  { icon: "ri-price-tag-3-line", title: "Upfront fares", text: "See every fare before you book." },
];

const Start = () => (
  <div className="theme-dark min-h-screen bg-canvas text-ink">
    <div className="mx-auto flex w-full max-w-3xl flex-col px-6 pb-12 pt-8">
      <header className="flex items-center justify-between">
        <img src={logo} alt="Dhanno" className="h-10 w-auto" />
      </header>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-14"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-strong">Ride, your way</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Get where you're going with Dhanno.
        </h1>
        <p className="mt-4 max-w-md text-ink-2">
          Book a ride in a few taps, or drive and keep 80% of every fare.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:max-w-md">
          <Link
            to="/user/login"
            className="flex items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-base font-semibold text-canvas transition active:scale-[0.98]"
          >
            <i className="ri-user-smile-line" /> Login as Rider
          </Link>
          <Link
            to="/captain/login"
            className="flex items-center justify-center gap-2 rounded-2xl bg-success py-4 text-base font-semibold text-white transition active:scale-[0.98]"
          >
            <i className="ri-steering-2-line" /> Login as Captain
          </Link>
          <p className="text-center text-sm text-ink-3 sm:text-left">
            New here?{" "}
            <Link to="/user/signup" className="font-semibold text-ink underline underline-offset-4">Sign up as rider</Link>
            {" · "}
            <Link to="/captain/signup" className="font-semibold text-ink underline underline-offset-4">Register as captain</Link>
          </p>
        </div>
      </motion.section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-line bg-surface p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/20 text-brand-strong">
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
