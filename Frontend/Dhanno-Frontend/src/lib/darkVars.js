/**
 * Dark palette applied as inline CSS variables on the root of pages that must
 * always be dark (landing, login, signup). Inline styles don't depend on class
 * cascade, so the look is identical on every phone and laptop browser.
 */
export const DARK_VARS = {
  "--canvas": "#0d1017",
  "--surface": "#161a23",
  "--surface-2": "#1d222d",
  "--surface-3": "#283040",
  "--ink": "#f3f4f6",
  "--ink-2": "#b4bbc8",
  "--ink-3": "#8b93a3",
  "--line": "#2b3140",
  "--brand": "#facc15",
  "--brand-strong": "#fbbf24",
  "--brand-ink": "#1a1400",
  "--success": "#22c55e",
  "--danger": "#f87171",
  "--info": "#60a5fa",
  colorScheme: "dark",
};