import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CAT_COLORS = {
  rock:       ['#7C3AED','#5B21B6'],
  pop:        ['#EC4899','#9D174D'],
  jazz:       ['#FB923C','#C2410C'],
  electronic: ['#3B82F6','#1D4ED8'],
  techno:     ['#8B5CF6','#5B21B6'],
  house:      ['#06B6D4','#0E7490'],
  festival:   ['#10B981','#065F46'],
  classical:  ['#A78BFA','#5B21B6'],
  default:    ['#4B5563','#1F2937'],
};

function catGradient(cat = '') {
  const key = cat.toLowerCase();
  const [c1, c2] = CAT_COLORS[key] || CAT_COLORS.default;
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

// Small overlapping avatar dots for social proof
function MiniAvatars({ count }) {
  if (!count || count < 2) return null;
  const colors = ['#7C3AED','#EC4899','#3B82F6','#10B981','#FB923C'];
  const shown = Math.min(count > 99 ? 4 : 3, 4);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={i}
            className="rounded-full border-2"
            style={{
              width: 18, height: 18,
              background: colors[i % colors.length],
              borderColor: '#1E1838',
              marginLeft: i > 0 ? -6 : 0,
              zIndex: shown - i,
              position: 'relative',
            }}
          />
        ))}
      </div>
      <span className="text-[11px] text-textMuted font-body">{count > 99 ? '99+' : count} going</span>
    </div>
  );
}

export default function EventCard({ event, attendingCount }) {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasImage = !!event.image_url && !event.image_url.endsWith('.svg');
  const date = event.start_time
    ? new Date(event.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '';
  const time = event.start_time
    ? new Date(event.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <motion.div
      onClick={() => navigate(`/event/${event.id}`)}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(30,24,56,0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(167,139,250,0.15)',
        boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.1), 0 4px 24px rgba(0,0,0,0.4)',
      }}
      whileHover={{
        y: -5,
        borderColor: 'rgba(167,139,250,0.4)',
        boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.2), 0 12px 40px rgba(124,58,237,0.35)',
        transition: { duration: 0.22, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98, y: -2 }}
    >
      {/* Image / Hero area */}
      <div className="relative h-44 overflow-hidden">
        {/* Background: image or gradient */}
        {hasImage ? (
          <motion.div className="absolute inset-0" variants={{ hover: { scale: 1.06 } }} transition={{ duration: 0.4 }}>
            <motion.img
              src={event.image_url}
              alt={event.title}
              onLoad={() => setImgLoaded(true)}
              className="w-full h-full object-cover"
              animate={{ filter: imgLoaded ? 'blur(0px) brightness(0.85)' : 'blur(8px) brightness(0.5)', opacity: imgLoaded ? 1 : 0.6 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0" style={{ background: catGradient(event.category), opacity: 0.75 }}>
            {/* Decorative pattern */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span style={{ fontSize: 80, filter: 'blur(2px)' }}>✦</span>
            </div>
          </div>
        )}

        {/* Gradient overlay — always present */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(13,10,26,0.1) 0%, rgba(30,24,56,0.5) 60%, rgba(30,24,56,0.95) 100%)' }}
        />

        {/* Category badge — top left */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full font-body"
            style={{
              background: 'rgba(13,10,26,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(167,139,250,0.3)',
              color: '#A78BFA',
            }}
          >
            {event.category || 'Event'}
          </span>
        </div>

        {/* Heart button — top right */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); setSaved(s => !s); }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(13,10,26,0.55)',
            backdropFilter: 'blur(8px)',
            border: saved ? '1px solid rgba(236,72,153,0.6)' : '1px solid rgba(167,139,250,0.25)',
            color: saved ? '#EC4899' : 'rgba(255,255,255,0.6)',
          }}
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
          animate={saved ? { color: '#EC4899' } : { color: 'rgba(255,255,255,0.6)' }}
        >
          {saved ? '♥' : '♡'}
        </motion.button>
      </div>

      {/* Info section */}
      <div className="px-4 pt-3 pb-4">
        <h3 className="text-text font-bold text-[15px] leading-snug mb-1 font-display truncate">{event.title}</h3>
        <p className="text-textMuted text-xs mb-2 font-body truncate">
          {event.venue}{date ? ` · ${date}, ${time}` : ''}
        </p>

        {/* Bottom row: price + social proof */}
        <div className="flex items-center justify-between mt-2">
          {event.price_text ? (
            <span className="text-[13px] font-semibold font-display" style={{ color: '#FB923C' }}>
              {event.price_text}
            </span>
          ) : (
            <span className="text-[13px] font-semibold font-display" style={{ color: '#10B981' }}>Free</span>
          )}
          <MiniAvatars count={attendingCount} />
        </div>
      </div>
    </motion.div>
  );
}
