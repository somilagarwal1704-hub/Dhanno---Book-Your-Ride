import { motion } from "motion/react";

/** Bottom sheet that slides in with a spring. Pass `open` to show/hide. */
const Sheet = ({ open, children, className = "", label }) => (
  <motion.div
    aria-label={label}
    initial={false}
    animate={{ y: open ? 0 : "110%", opacity: open ? 1 : 0 }}
    transition={{ type: "spring", stiffness: 320, damping: 34 }}
    className={`pointer-events-auto absolute inset-x-0 bottom-0 z-10 max-h-[85%] overflow-y-auto rounded-t-[1.75rem] border-t border-line bg-gradient-to-b from-surface-2 to-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-card dh-no-scrollbar ${className}`}
    style={{ pointerEvents: open ? "auto" : "none" }}
  >
    <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-surface-3" />
    {children}
  </motion.div>
);

export default Sheet;
