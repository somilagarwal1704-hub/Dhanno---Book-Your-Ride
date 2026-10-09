import { useState } from "react";
import { motion } from "motion/react";
import Button from "../ui/Button.jsx";

const LABELS = ["Terrible", "Bad", "Okay", "Good", "Excellent"];

const RatingForm = ({ name, onSubmit, submitting, error }) => {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const shown = hover || stars;

  return (
    <div className="text-center">
      <p className="text-sm text-ink-2">How was your ride with</p>
      <h3 className="mb-4 text-lg font-bold text-ink">{name || "your captain"}?</h3>

      <div className="mb-1 flex justify-center gap-1.5" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            whileTap={{ scale: 0.8 }}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(n)}
            className="p-1"
          >
            <i className={`${n <= shown ? "ri-star-fill text-brand-strong" : "ri-star-line text-ink-3"} text-4xl transition`} />
          </motion.button>
        ))}
      </div>
      <p className="mb-4 h-5 text-sm font-medium text-ink-2">{shown ? LABELS[shown - 1] : "Tap a star"}</p>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={300}
        rows={2}
        placeholder="Add a comment (optional)"
        className="mb-4 w-full resize-none rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink outline-none focus:border-brand"
      />

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}
      <Button disabled={!stars} loading={submitting} onClick={() => onSubmit({ stars, comment })}>
        Submit rating
      </Button>
    </div>
  );
};

export default RatingForm;
