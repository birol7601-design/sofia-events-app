import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../lib/api';
import { isLoggedIn } from '../lib/auth';

const CAT_COLORS = {
  rock:       ['#7A3D00', '#4A1A00'],
  pop:        ['#C46A00', '#7A3D00'],
  jazz:       ['#FFB800', '#C46A00'],
  electronic: ['#1C1708', '#0A0A0A'],
  techno:     ['#3A2000', '#1C1000'],
  house:      ['#2A1800', '#120E04'],
  festival:   ['#FFB800', '#7A3D00'],
  classical:  ['#C7B68A', '#8A7B4A'],
  default:    ['#1C1708', '#0A0A0A'],
};

function catGradient(cat = '') {
  const [c1, c2] = CAT_COLORS[cat.toLowerCase()] || CAT_COLORS.default;
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

function MiniAvatars({ count }) {
  if (!count || count < 2) return null;
  const colors = ['#FFB800', '#C46A00', '#FFE45C', '#7A3D00', '#FFF4D6'];
  const shown  = Math.min(count > 99 ? 4 : 3, 4);
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
              borderColor: '#120E04',
              marginLeft: i > 0 ? -6 : 0,
              zIndex: shown - i,
              position: 'relative',
            }}
          />
        ))}
      </div>
      <span className="text-[11px] font-body" style={{ color: '#C7B68A' }}>
        {count > 99 ? '99+' : count} in the hive
      </span>
    </div>
  );
}

export default function EventCard({
  event,
  attendingCount,
  initialSaved     = false,
  initialAttending = false,
  onSaveChange,
  onAttendChange,
}) {
  const navigate = useNavigate();
  const [imgLoaded,    setImgLoaded]    = useState(false);
  const [saved,        setSaved]        = useState(initialSaved);
  const [attending,    setAttending]    = useState(initialAttending);
  const [saveFlying,   setSaveFlying]   = useState(false);
  const [attendFlying, setAttendFlying] = useState(false);

  useEffect(() => { setSaved(initialSaved); },      [initialSaved]);
  useEffect(() => { setAttending(initialAttending); }, [initialAttending]);

  const hasImage = !!event.image_url && !event.image_url.endsWith('.svg');
  const date = event.start_time
    ? new Date(event.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '';
  const time = event.start_time
    ? new Date(event.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '';

  const toggleSave = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { navigate('/auth'); return; }
    if (saveFlying) return;
    setSaved(s => !s);
    setSaveFlying(true);
    try {
      const data = await apiPost(`/api/users/saved/${event.id}`);
      setSaved(data.saved);
      onSaveChange?.(event.id, data.saved);
    } catch {
      setSaved(s => !s);
    } finally {
      setSaveFlying(false);
    }
  };

  const toggleAttend = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { navigate('/auth'); return; }
    if (attendFlying) return;
    setAttending(s => !s);
    setAttendFlying(true);
    try {
      const data = await apiPost(`/api/users/attending/${event.id}`);
      setAttending(data.attending);
      onAttendChange?.(event.id, data.attending);
    } catch {
      setAttending(s => !s);
    } finally {
      setAttendFlying(false);
    }
  };

  return (
    <motion.div
      onClick={() => navigate(`/event/${event.id}`)}
      className="gloss-card rounded-2xl overflow-hidden cursor-pointer"
      whileHover={{
        y: -5,
        borderColor: 'rgba(255,184,0,0.42)',
        boxShadow: 'inset 0 1px 0 rgba(255,220,80,0.1), 0 12px 40px rgba(255,184,0,0.14)',
        transition: { duration: 0.22, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98, y: -2 }}
    >
      {/* Hero area */}
      <div className="relative h-44 overflow-hidden">
        {hasImage ? (
          <motion.div className="absolute inset-0" transition={{ duration: 0.4 }}>
            <motion.img
              src={event.image_url}
              alt={event.title}
              onLoad={() => setImgLoaded(true)}
              className="w-full h-full object-cover"
              animate={{ filter: imgLoaded ? 'blur(0px) brightness(0.8)' : 'blur(8px) brightness(0.4)', opacity: imgLoaded ? 1 : 0.6 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0" style={{ background: catGradient(event.category), opacity: 0.82 }}>
            {/* Honeycomb pattern overlay */}
            <div className="absolute inset-0 comb-bg opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center opacity-25">
              <svg width="72" height="82" viewBox="0 0 100 115" fill="none">
                <polygon points="50,4 96,28 96,87 50,111 4,87 4,28" fill="rgba(255,255,255,0.15)" />
              </svg>
            </div>
          </div>
        )}

        {/* Bottom gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.08) 0%, rgba(18,14,4,0.5) 60%, rgba(18,14,4,0.96) 100%)' }}
        />

        {/* Category badge — top left */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full font-body"
            style={{
              background: 'rgba(10,6,0,0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,184,0,0.3)',
              color: '#FFB800',
            }}
          >
            {event.category || 'Event'}
          </span>
        </div>

        {/* Heart button — top right */}
        <motion.button
          onClick={toggleSave}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(10,6,0,0.6)',
            backdropFilter: 'blur(8px)',
            border: saved ? '1px solid rgba(255,184,0,0.7)' : '1px solid rgba(255,184,0,0.22)',
            color: saved ? '#FFB800' : 'rgba(255,244,214,0.5)',
            fontSize: 15,
          }}
          whileTap={{ scale: 0.82 }}
          whileHover={{ scale: 1.1 }}
          animate={saved ? { color: '#FFB800' } : { color: 'rgba(255,244,214,0.5)' }}
        >
          {saved ? '♥' : '♡'}
        </motion.button>
      </div>

      {/* Info section */}
      <div className="px-4 pt-3 pb-4">
        <h3 className="font-bold text-[15px] leading-snug mb-1 font-display truncate" style={{ color: '#FFF4D6' }}>
          {event.title}
        </h3>
        <p className="text-xs mb-2 font-body truncate" style={{ color: '#C7B68A' }}>
          {event.venue}{date ? ` · ${date}, ${time}` : ''}
        </p>

        {/* Bottom row: price + going badge + avatars */}
        <div className="flex items-center justify-between mt-2">
          {event.price_text ? (
            <span className="text-[13px] font-bold font-display" style={{ color: '#FFB800' }}>
              {event.price_text}
            </span>
          ) : (
            <span className="text-[13px] font-bold font-display" style={{ color: '#FFE45C' }}>Free</span>
          )}

          <div className="flex items-center gap-2">
            {attending && (
              <motion.button
                onClick={toggleAttend}
                className="text-[10px] font-bold font-body px-2 py-0.5 rounded-full leading-none"
                style={{
                  background: 'rgba(255,184,0,0.15)',
                  color: '#FFB800',
                  border: '1px solid rgba(255,184,0,0.35)',
                }}
                whileTap={{ scale: 0.86 }}
              >
                🐝 Going
              </motion.button>
            )}
            <MiniAvatars count={attendingCount} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
