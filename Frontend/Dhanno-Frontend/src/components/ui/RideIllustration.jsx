/** Animated route illustration for the landing hero. Pure SVG, no image download needed. */
const RideIllustration = () => (
  <svg viewBox="0 0 360 240" className="h-auto w-full" role="img" aria-label="A car driving a route from pickup to destination">
    <defs>
      <linearGradient id="routeGlow" x1="0" x2="1">
        <stop offset="0%" stopColor="#facc15" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#facc15" stopOpacity="0.9" />
      </linearGradient>
      <radialGradient id="sky" cx="50%" cy="0%" r="90%">
        <stop offset="0%" stopColor="#24304a" />
        <stop offset="100%" stopColor="#12161f" />
      </radialGradient>
    </defs>

    <rect width="360" height="240" rx="24" fill="url(#sky)" />

    {/* city blocks */}
    <g stroke="#2c3750" strokeWidth="1.2" fill="none" opacity="0.9">
      {[40, 80, 120, 160, 200].map((y) => <line key={`h${y}`} x1="0" x2="360" y1={y} y2={y} />)}
      {[60, 120, 180, 240, 300].map((x) => <line key={`v${x}`} x1={x} x2={x} y1="0" y2="240" />)}
    </g>
    <path d="M0 150 Q 90 120 180 150 T 360 130" stroke="#334155" strokeWidth="10" fill="none" opacity="0.6" />

    {/* route */}
    <path d="M52 178 C 110 178, 120 92, 186 96 S 270 62, 310 62" stroke="url(#routeGlow)" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M52 178 C 110 178, 120 92, 186 96 S 270 62, 310 62" stroke="#facc15" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="2 10" className="dh-route" />

    {/* pickup */}
    <circle cx="52" cy="178" r="11" fill="#22c55e" stroke="#0d1017" strokeWidth="4" />
    {/* destination */}
    <path d="M310 40 a14 14 0 0 1 14 14 c0 12 -14 26 -14 26 s-14 -14 -14 -26 a14 14 0 0 1 14 -14z" fill="#f87171" />
    <circle cx="310" cy="54" r="5" fill="#0d1017" />

    {/* car on the route */}
    <g>
      <circle cx="186" cy="96" r="18" fill="#facc15" />
      <circle cx="186" cy="96" r="18" fill="none" stroke="#facc15" strokeOpacity="0.5" strokeWidth="6">
        <animate attributeName="r" values="18;30;18" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <path d="M176 100 l4 -10 h12 l4 10 z" fill="#1a1400" />
      <rect x="174" y="98" width="24" height="7" rx="3" fill="#1a1400" />
    </g>

    {/* price tag */}
    <g transform="translate(206 186)">
      <rect width="112" height="34" rx="17" fill="#f3f4f6" />
      <text x="56" y="22" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="14" fontWeight="700" fill="#0d1017">₹248 · 44 km</text>
    </g>
  </svg>
);

export default RideIllustration;
