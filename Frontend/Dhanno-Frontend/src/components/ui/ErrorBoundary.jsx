import { Component } from "react";
import { DARK_VARS } from "../../lib/darkVars.js";

/** Shows a readable message instead of a blank screen when a page crashes. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Dhanno UI error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center text-ink" style={{ ...DARK_VARS, backgroundColor: DARK_VARS["--canvas"] }}>
        <p className="text-lg font-semibold">This screen hit a problem.</p>
        <p className="max-w-sm text-sm text-ink-2">{String(this.state.error?.message || this.state.error)}</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => window.location.reload()} className="rounded-2xl bg-brand px-5 py-3 font-semibold text-brand-ink">Reload</button>
          <a href="/home" className="rounded-2xl border border-line px-5 py-3 font-semibold text-ink">Go to home</a>
        </div>
      </div>
    );
  }
}
