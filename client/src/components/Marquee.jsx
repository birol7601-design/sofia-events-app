import { useRef, useEffect } from 'react';

export default function Marquee({ items = [], speed = 40 }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let x = 0;
    let raf;
    const half = el.scrollWidth / 2;
    const tick = () => {
      x -= speed / 60;
      if (Math.abs(x) >= half) x = 0;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden whitespace-nowrap py-2">
      <div ref={trackRef} className="inline-flex gap-6 will-change-transform">
        {doubled.map((item, i) => (
          <span key={i} className="text-textMuted/50 text-xs font-display tracking-widest uppercase">
            {item} <span className="text-primary mx-2">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
