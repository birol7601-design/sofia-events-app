const DEFAULT_ITEMS = [
  'TRENDING', 'LIVE EVENTS', '50K+ NIGHTS OUT', 'FEATURED', 'SOFIA',
  'UNDERGROUND', 'JAZZ & SOUL', 'ELECTRONIC', 'FESTIVALS', 'ROCK LIVE',
];

export default function Marquee({ items = DEFAULT_ITEMS }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.85) 0%, rgba(236,72,153,0.85) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(124,58,237,0.85), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, rgba(236,72,153,0.85), transparent)' }} />

      <div className="flex animate-marquee whitespace-nowrap py-2.5" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 mx-4 text-white/90 text-[11px] font-bold uppercase tracking-[2.5px] font-display"
          >
            {item}
            <span className="text-white/50 text-[8px]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
