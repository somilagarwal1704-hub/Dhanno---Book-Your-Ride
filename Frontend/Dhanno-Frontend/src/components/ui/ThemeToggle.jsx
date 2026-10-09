import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../../context/ThemeContext.jsx";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-line bg-surface text-ink shadow-card transition hover:scale-105 active:scale-95 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.i
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25 }}
          className={isDark ? "ri-moon-fill text-lg" : "ri-sun-fill text-lg text-brand-strong"}
        />
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
