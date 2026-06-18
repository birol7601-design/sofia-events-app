// Honey/amber recolored avatar types
const CONFIGS = {
  star: {
    g: ['#FFB800', '#C46A00'],
    icon: (s) => (
      <svg width={s*0.52} height={s*0.52} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L13.8 9H21L15.1 13.6L17.2 21L12 16.8L6.8 21L8.9 13.6L3 9H10.2L12 2Z"
          fill="white" fillOpacity="0.92"/>
      </svg>
    ),
  },
  crown: {
    g: ['#FFE45C', '#FFB800'],
    icon: (s) => (
      <svg width={s*0.52} height={s*0.52} viewBox="0 0 24 24" fill="none">
        <path d="M3 17L5 9L9 13L12 6L15 13L19 9L21 17H3Z" fill="#1A0A00" fillOpacity="0.85"/>
        <rect x="3" y="18" width="18" height="2" rx="1" fill="#1A0A00" fillOpacity="0.65"/>
      </svg>
    ),
  },
  moon: {
    g: ['#C46A00', '#7A3D00'],
    icon: (s) => (
      <svg width={s*0.52} height={s*0.52} viewBox="0 0 24 24" fill="none">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
          fill="white" fillOpacity="0.92"/>
      </svg>
    ),
  },
  diamond: {
    g: ['#FFF4D6', '#FFB800'],
    icon: (s) => (
      <svg width={s*0.52} height={s*0.52} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L22 12L12 22L2 12Z" fill="#1A0A00" fillOpacity="0.8"/>
        <path d="M12 6L18 12L12 18L6 12Z" fill="#1A0A00" fillOpacity="0.3"/>
      </svg>
    ),
  },
  flame: {
    g: ['#FFB800', '#C46A00'],
    icon: (s) => (
      <svg width={s*0.52} height={s*0.52} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C12 2 8 7 8 12C8 14 9 15.5 10 16.5C10 14 11 13 12 12C12 14 13.5 15 14 16.5C15.5 15 16 13.5 16 12C16 9 14 6 12 2Z"
          fill="white" fillOpacity="0.95"/>
        <path d="M12 13C12 13 10 15 10 17.5C10 19.5 10.9 21 12 22C13.1 21 14 19.5 14 17.5C14 15 12 13 12 13Z"
          fill="white" fillOpacity="0.7"/>
      </svg>
    ),
  },
  compass: {
    g: ['#FFE45C', '#C46A00'],
    icon: (s) => (
      <svg width={s*0.52} height={s*0.52} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#1A0A00" strokeOpacity="0.5" strokeWidth="1.5" fill="none"/>
        <path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke="#1A0A00" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round"/>
        <polygon points="12,5 14,12 12,14 10,12" fill="#1A0A00" fillOpacity="0.9"/>
        <polygon points="12,19 14,12 12,10 10,12" fill="#1A0A00" fillOpacity="0.4"/>
      </svg>
    ),
  },
  eye: {
    g: ['#7A3D00', '#FFB800'],
    icon: (s) => (
      <svg width={s*0.52} height={s*0.52} viewBox="0 0 24 24" fill="none">
        <path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z"
          stroke="white" strokeOpacity="0.85" strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="12" r="3.5" fill="white" fillOpacity="0.9"/>
        <circle cx="13.2" cy="10.8" r="1" fill="white" fillOpacity="0.5"/>
      </svg>
    ),
  },
  vinyl: {
    g: ['#1C1708', '#FFB800'],
    icon: (s) => (
      <svg width={s*0.52} height={s*0.52} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.6" strokeWidth="1" fill="none"/>
        <circle cx="12" cy="12" r="7"  stroke="white" strokeOpacity="0.35" strokeWidth="1" fill="none"/>
        <circle cx="12" cy="12" r="4"  stroke="white" strokeOpacity="0.5" strokeWidth="1" fill="none"/>
        <circle cx="12" cy="12" r="1.8" fill="white" fillOpacity="0.9"/>
        <circle cx="12" cy="12" r="0.7" fill="rgba(28,23,8,0.8)"/>
      </svg>
    ),
  },
};

export default function Avatar({ type = 'star', size = 40, ring = false, name = '' }) {
  const cfg = CONFIGS[type] || CONFIGS.star;
  const [c1, c2] = cfg.g;
  const initial = name ? name[0].toUpperCase() : null;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        userSelect: 'none',
        boxShadow: ring
          ? `0 0 0 2px #FFB800, 0 0 0 4px rgba(255,184,0,0.22), 0 0 16px rgba(255,184,0,0.28)`
          : `0 2px 12px rgba(0,0,0,0.45)`,
      }}
    >
      {initial
        ? <span style={{ color: 'rgba(26,10,0,0.9)', fontSize: size * 0.42, fontWeight: 700, fontFamily: '"Sora", sans-serif' }}>{initial}</span>
        : cfg.icon(size)
      }
    </div>
  );
}
