const DEFAULT_ITEMS = [
  'TRENDING', 'LIVE EVENTS', '50K+ NIGHTS', 'FEATURED', 'SOFIA',
  'UNDERGROUND', 'JAZZ & SOUL', 'ELECTRONIC', 'FESTIVALS', 'ROCK LIVE',
];

export default function Marquee({ items = DEFAULT_ITEMS }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, rgba(28,23,8,0.95) 0%, rgba(18,14,4,0.98) 100%)',
        borderTop:    '1px solid rgba(255,184,0,0.15)',
        borderBottom: '1px solid rgba(255,184,0,0.15)',
      }}
    >
      {/* Edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(18,14,4,0.98), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, rgba(18,14,4,0.98), transparent)' }} />

      <div className="flex animate-marquee whitespace-nowrap py-2.5" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 mx-4 text-[11px] font-bold uppercase tracking-[2.5px] font-display"
            style={{ color: '#C7B68A' }}
          >
            {item}
            {/* Hexagon separator */}
            <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
              <polygon points="4,0 8,2.25 8,6.75 4,9 0,6.75 0,2.25" fill="#FFB800" fillOpacity="0.45" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
