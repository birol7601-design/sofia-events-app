import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../lib/api';
import { isLoggedIn } from '../lib/auth';
import EventCard from '../components/EventCard';
import BuzzSays from '../components/BuzzSays';
import { EventCardSkeleton } from '../components/Skeleton';

const CAT_COLORS = {
  rock:       ['#7A3D00', '#4A1A00'],
  pop:        ['#C46A00', '#7A3D00'],
  jazz:       ['#FFB800', '#C46A00'],
  electronic: ['#1C1708', '#0A0A0A'],
  techno:     ['#3A2000', '#1A0A00'],
  house:      ['#2A1800', '#120E04'],
  festival:   ['#FFB800', '#7A3D00'],
  classical:  ['#C7B68A', '#8A7B4A'],
  default:    ['#1C1708', '#0A0A0A'],
};
function catGradient(cat = '') {
  const [c1, c2] = CAT_COLORS[cat.toLowerCase()] || CAT_COLORS.default;
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

function InfoCard({ icon, label, value, sub }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: 'linear-gradient(160deg, #1C1708 0%, #120E04 100%)',
        border: '1px solid rgba(255,184,0,0.18)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-body uppercase tracking-widest" style={{ color: '#8A7B4A' }}>{label}</p>
        <p className="font-display font-semibold text-sm leading-snug truncate" style={{ color: '#FFF4D6' }}>{value}</p>
        {sub && <p className="text-xs font-body" style={{ color: '#C7B68A' }}>{sub}</p>}
      </div>
    </div>
  );
}

function GoingAvatars({ count }) {
  if (!count || count < 1) return null;
  const colors = ['#FFB800', '#C46A00', '#FFE45C', '#7A3D00', '#FFF4D6'];
  const shown  = Math.min(count, 4);
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={i}
            className="rounded-full border-2"
            style={{
              width: 26, height: 26,
              background: colors[i % colors.length],
              borderColor: '#0A0A0A',
              marginLeft: i > 0 ? -8 : 0,
              zIndex: shown - i,
              position: 'relative',
            }}
          />
        ))}
      </div>
      <span className="text-sm font-body" style={{ color: '#C7B68A' }}>
        <strong style={{ color: '#FFB800' }}>{count}</strong> in the hive
      </span>
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -15, transition: { duration: 0.22 } },
};

export default function EventDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const heroRef  = useRef(null);

  const { scrollY }   = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 350], [0, 70]);
  const heroScale     = useTransform(scrollY, [0, 350], [1, 1.12]);

  const [event,        setEvent]        = useState(null);
  const [moreEvents,   setMoreEvents]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saved,        setSaved]        = useState(false);
  const [attending,    setAttending]    = useState(false);
  const [saveFlying,   setSaveFlying]   = useState(false);
  const [attendFlying, setAttendFlying] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const ev = await apiGet(`/api/events/${id}`);
        setEvent(ev);
        const all = await apiGet('/api/events');
        setMoreEvents(all.filter(e => e.id !== parseInt(id) && e.category === ev.category).slice(0, 4));
        if (isLoggedIn()) {
          try {
            const [savedData, attendingData] = await Promise.all([
              apiGet('/api/users/saved/ids'),
              apiGet('/api/users/attending/ids'),
            ]);
            setSaved(Array.isArray(savedData?.savedIds) && savedData.savedIds.includes(parseInt(id)));
            setAttending(Array.isArray(attendingData?.attendingIds) && attendingData.attendingIds.includes(parseInt(id)));
          } catch {}
        }
      } catch (err) {
        console.error('Failed to load event:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const toggleSave = async () => {
    if (!isLoggedIn()) { navigate('/auth'); return; }
    if (saveFlying) return;
    setSaved(s => !s);
    setSaveFlying(true);
    try {
      const data = await apiPost(`/api/users/saved/${id}`);
      setSaved(data.saved);
    } catch {
      setSaved(s => !s);
    } finally {
      setSaveFlying(false);
    }
  };

  const toggleAttend = async () => {
    if (!isLoggedIn()) { navigate('/auth'); return; }
    if (attendFlying) return;
    setAttending(s => !s);
    setAttendFlying(true);
    try {
      const data = await apiPost(`/api/users/attending/${id}`);
      setAttending(data.attending);
    } catch {
      setAttending(s => !s);
    } finally {
      setAttendFlying(false);
    }
  };

  const hasImage = !!event?.image_url && !event?.image_url.endsWith('.svg');
  const date = event?.start_time
    ? new Date(event.start_time).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const time = event?.start_time
    ? new Date(event.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '';

  if (loading) {
    return (
      <div className="min-h-dvh pb-28 comb-bg">
        <div className="h-72 shimmer-bg" />
        <div className="px-5 pt-4 space-y-3">
          {[0, 1].map(i => <EventCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-body" style={{ color: '#8A7B4A' }}>Event not found.</p>
        <button onClick={() => navigate(-1)} className="text-sm font-body" style={{ color: '#FFB800' }}>
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={pageVariants} initial="initial" animate="animate" exit="exit"
        className="flex flex-col min-h-dvh pb-32 comb-bg"
      >
        {/* Hero with scroll parallax */}
        <div className="relative h-72 overflow-hidden" ref={heroRef}>
          {hasImage ? (
            <motion.img
              src={event.image_url}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ y: heroParallaxY, scale: heroScale }}
            />
          ) : (
            <motion.div
              className="absolute inset-0"
              style={{ background: catGradient(event.category || ''), y: heroParallaxY, scale: heroScale }}
            >
              <div className="absolute inset-0 comb-bg opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center opacity-15">
                <svg width="140" height="161" viewBox="0 0 100 115" fill="none">
                  <polygon points="50,4 96,28 96,87 50,111 4,87 4,28" fill="rgba(255,255,255,0.18)" />
                </svg>
              </div>
            </motion.div>
          )}

          {/* Bottom gradient — honey to dark */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,6,0,0) 35%, rgba(10,6,0,0.82) 80%, rgba(10,6,0,1) 100%)' }}
          />

          {/* Back button */}
          <motion.button
            onClick={() => navigate(-1)}
            className="absolute top-12 left-4 z-20 w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(10,6,0,0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,184,0,0.25)',
              color: '#FFF4D6',
              fontSize: 16,
            }}
            whileTap={{ scale: 0.86 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.15 } }}
          >
            ←
          </motion.button>

          {/* Category + title at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-3 z-10">
            {event.category && (
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full font-body mb-2 inline-block"
                style={{
                  background: 'rgba(10,6,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,184,0,0.35)',
                  color: '#FFB800',
                }}
              >
                {event.category}
              </span>
            )}
            <h1 className="font-display font-bold text-2xl leading-tight" style={{ color: '#FFF4D6' }}>
              {event.title}
            </h1>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 mt-4 space-y-5">
          {/* In the hive count */}
          {event.attending_count > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.18 } }}>
              <GoingAvatars count={event.attending_count} />
            </motion.div>
          )}

          {/* When / Where / Price */}
          <motion.div
            className="grid gap-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.14, duration: 0.38 } }}
          >
            {date             && <InfoCard icon="📅" label="When"  value={date} sub={time} />}
            {event.venue      && <InfoCard icon="📍" label="Where" value={event.venue} sub={event.address || null} />}
            {event.price_text && <InfoCard icon="🎟" label="Price" value={event.price_text} />}
          </motion.div>

          {/* BuzzSays */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.22 } }}>
            <BuzzSays page="event" />
          </motion.div>

          {/* About */}
          {event.description && (
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.28 } }}>
              <h2 className="font-display font-bold text-lg mb-2" style={{ color: '#FFF4D6' }}>About</h2>
              <p className="text-sm font-body leading-relaxed" style={{ color: '#C7B68A' }}>{event.description}</p>
            </motion.section>
          )}

          {/* Artist bio */}
          {(event.artist_bio || event.organizer_bio || event.artist) && (
            <motion.section
              className="rounded-2xl p-4"
              style={{
                background: 'linear-gradient(160deg, #1C1708 0%, #120E04 100%)',
                border: '1px solid rgba(255,184,0,0.18)',
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.34 } }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[2px] mb-1 font-body" style={{ color: '#FFB800' }}>
                🐝 About the artist
              </p>
              {event.artist && (
                <h3 className="font-display font-semibold text-base mb-1" style={{ color: '#FFF4D6' }}>{event.artist}</h3>
              )}
              <p className="text-sm font-body leading-relaxed" style={{ color: '#C7B68A' }}>
                {event.artist_bio || event.organizer_bio}
              </p>
            </motion.section>
          )}

          {/* Ticket link */}
          {event.ticket_url && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.38 } }}>
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold font-body"
                style={{
                  background: 'rgba(28,23,8,0.8)',
                  border: '1px solid rgba(255,184,0,0.28)',
                  color: '#FFB800',
                }}
              >
                Buy tickets ↗
              </a>
            </motion.div>
          )}

          {/* More in category */}
          {moreEvents.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.42 } }}
            >
              <h2 className="font-display font-bold text-lg mb-3" style={{ color: '#FFF4D6' }}>
                More {event.category} events
              </h2>
              <div className="space-y-3">
                {moreEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
              </div>
            </motion.section>
          )}
        </div>
      </motion.div>

      {/* Sticky bottom action bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-8 pt-4"
        style={{
          background: 'rgba(10,6,0,0.94)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,184,0,0.18)',
        }}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.48, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      >
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {/* Save heart */}
          <motion.button
            onClick={toggleSave}
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{
              background: saved ? 'rgba(255,184,0,0.18)' : 'rgba(28,23,8,0.9)',
              border: saved ? '1px solid rgba(255,184,0,0.7)' : '1px solid rgba(255,184,0,0.2)',
              color: saved ? '#FFB800' : '#8A7B4A',
            }}
            whileTap={{ scale: 0.82 }}
            animate={{ scale: saved ? [1, 1.22, 1] : 1 }}
            transition={{ duration: 0.28 }}
          >
            {saved ? '♥' : '♡'}
          </motion.button>

          {/* Price */}
          {event.price_text && (
            <div className="flex-shrink-0">
              <p className="text-[10px] font-body leading-none" style={{ color: '#8A7B4A' }}>from</p>
              <p className="font-display font-bold text-base leading-tight" style={{ color: '#FFB800' }}>
                {event.price_text}
              </p>
            </div>
          )}

          {/* GET YOUR SPOT button */}
          <motion.button
            onClick={toggleAttend}
            className="flex-1 h-12 rounded-2xl font-display font-bold text-sm"
            style={{
              background: attending
                ? 'rgba(28,23,8,0.9)'
                : 'radial-gradient(ellipse 80% 140% at 35% 20%, #FFF7C0 0%, #FFE45C 22%, #FFB800 55%, #D87A00 100%)',
              border: attending ? '1px solid rgba(255,184,0,0.5)' : 'none',
              color: attending ? '#FFB800' : '#7A3D00',
              boxShadow: attending
                ? 'none'
                : '0 6px 18px rgba(255,150,0,0.38), inset 0 2px 5px rgba(255,255,255,0.65), inset 0 -3px 8px rgba(150,70,0,0.45)',
              position: 'relative',
              overflow: 'hidden',
            }}
            whileTap={{ scale: 0.96 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={attending ? 'yes' : 'no'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="block"
              >
                {attending ? '🐝 Going ✓' : 'GET YOUR SPOT'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
