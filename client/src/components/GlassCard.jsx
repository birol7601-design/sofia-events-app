import { motion } from 'framer-motion';

const GLOW = {
  primary: {
    rest:        '0 4px 24px rgba(0,0,0,0.5)',
    hover:       '0 8px 40px rgba(255,184,0,0.22)',
    borderHover: 'rgba(255,184,0,0.45)',
  },
  accent: {
    rest:        '0 4px 24px rgba(0,0,0,0.5)',
    hover:       '0 8px 40px rgba(196,106,0,0.35)',
    borderHover: 'rgba(255,184,0,0.5)',
  },
  none: {
    rest:        '0 4px 24px rgba(0,0,0,0.5)',
    hover:       '0 6px 30px rgba(0,0,0,0.6)',
    borderHover: 'rgba(255,184,0,0.3)',
  },
};

export default function GlassCard({
  children,
  className = '',
  onClick,
  glow = 'none',
  padding = true,
  style = {},
}) {
  const g = GLOW[glow] || GLOW.none;
  const interactive = !!onClick;

  return (
    <motion.div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`gloss-card rounded-2xl ${padding ? 'p-4' : ''} ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{ boxShadow: g.rest, ...style }}
      whileHover={interactive ? {
        y: -4,
        borderColor: g.borderHover,
        boxShadow: g.hover,
        transition: { duration: 0.22, ease: 'easeOut' },
      } : undefined}
      whileTap={interactive ? { scale: 0.98, y: -2 } : undefined}
    >
      {children}
    </motion.div>
  );
}
