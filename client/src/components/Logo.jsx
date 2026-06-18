export default function Logo({ size = 48 }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.15)}
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="honey-gloss" cx="35%" cy="22%" r="70%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#FFF7C0" />
          <stop offset="22%"  stopColor="#FFE45C" />
          <stop offset="55%"  stopColor="#FFB800" />
          <stop offset="100%" stopColor="#C46A00" />
        </radialGradient>
        <filter id="gloss-blur">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      {/* Hex cell */}
      <polygon
        points="50,4 96,28 96,87 50,111 4,87 4,28"
        fill="url(#honey-gloss)"
      />

      {/* Upper-left gloss highlight */}
      <ellipse
        cx="33" cy="28" rx="24" ry="11"
        fill="rgba(255,255,255,0.32)"
        filter="url(#gloss-blur)"
      />

      {/* Wings (behind body) */}
      <ellipse cx="34" cy="57" rx="12" ry="5.5"
        fill="rgba(255,255,255,0.84)"
        transform="rotate(-28 34 57)"
      />
      <ellipse cx="66" cy="57" rx="12" ry="5.5"
        fill="rgba(255,255,255,0.84)"
        transform="rotate(28 66 57)"
      />

      {/* Body */}
      <ellipse cx="50" cy="70" rx="9" ry="13" fill="#1A1200" />

      {/* Head */}
      <circle cx="50" cy="53" r="7.5" fill="#1A1200" />

      {/* Gold stripes */}
      <rect x="42" y="63" width="16" height="3"   rx="1.5" fill="#FFB800" fillOpacity="0.9" />
      <rect x="42" y="69.5" width="16" height="3" rx="1.5" fill="#FFB800" fillOpacity="0.9" />
      <rect x="42" y="76" width="16" height="3"   rx="1.5" fill="#FFB800" fillOpacity="0.9" />

      {/* Antennae */}
      <line x1="46" y1="46" x2="38" y2="36" stroke="#1A1200" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="54" y1="46" x2="62" y2="36" stroke="#1A1200" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="37" cy="35" r="3" fill="#FFB800" />
      <circle cx="63" cy="35" r="3" fill="#FFB800" />
    </svg>
  );
}
