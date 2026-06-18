import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import { isLoggedIn } from '../lib/auth';
import EventCard from '../components/EventCard';
import BuzzSays from '../components/BuzzSays';
import Marquee from '../components/Marquee';
import { EventCardSkeleton } from '../components/Skeleton';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 18 },
  animate: i => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.055, duration: 0.38, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.16 } },
};

export default function Feed() {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState('all');
  const [scrolled, setScrolled] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    apiGet('/api/events')
      .then(setEvents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
    if (isLoggedIn()) {
      apiGet('/api/users/saved/ids')
        .then(d => setSavedIds(new Set(d?.savedIds || [])))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const categories = ['all', ...new Set(events.map(e => e.category).filter(Boolean))];
  const filtered   = filter === 'all' ? events : events.filter(e => e.category === filter);
  const featured   = filtered.filter(e => e.featured);
  const regular    = filtered.filter(e => !e.featured);

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-24 comb-bg"
    >
      {/* Sticky frosted header */}
      <div
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(10,6,0,0.95)' : 'rgba(10,6,0,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(255,184,0,0.2)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="px-5 pt-10 pb-2">
          <h1 className="font-display font-bold text-2xl" style={{ color: '#FFF4D6' }}>Events</h1>
          <p className="text-sm font-body" style={{ color: '#8A7B4A' }}>What's buzzing in Sofia</p>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto scrollbar-none">
          {categories.map(cat => (
            <motion.button
              key={cat}
              onClick={() => setFilter(cat)}
              className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold font-body"
              style={{
                background: filter === cat
                  ? 'radial-gradient(ellipse 80% 140% at 35% 20%, #FFE45C 0%, #FFB800 55%, #C46A00 100%)'
                  : 'rgba(28,23,8,0.9)',
                border: filter === cat
                  ? '1px solid rgba(255,184,0,0.5)'
                  : '1px solid rgba(255,184,0,0.15)',
                color: filter === cat ? '#7A3D00' : '#C7B68A',
                fontWeight: filter === cat ? 800 : 600,
                boxShadow: filter === cat ? '0 0 12px rgba(255,184,0,0.3)' : 'none',
              }}
              whileTap={{ scale: 0.91 }}
            >
              {cat === 'all' ? '🐝 All' : cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Marquee accent strip */}
      <Marquee />

      {/* BuzzSays */}
      <div className="px-5 mt-4">
        <BuzzSays page="feed" />
      </div>

      {/* Event list */}
      <div className="px-5 mt-4 flex-1">
        {loading && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => <EventCardSkeleton key={i} />)}
          </div>
        )}
        {error && (
          <p className="text-sm text-center py-12 font-body" style={{ color: '#FF6B35' }}>{error}</p>
        )}

        {!loading && !error && (
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm text-center py-14 font-body"
                style={{ color: '#8A7B4A' }}
              >
                No events in this category yet.
              </motion.p>
            ) : (
              <motion.div
                key={filter}
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Featured events */}
                {featured.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    custom={i}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full font-body"
                        style={{
                          background: 'radial-gradient(ellipse 80% 140% at 35% 20%, #FFE45C 0%, #FFB800 55%, #C46A00 100%)',
                          color: '#7A3D00',
                        }}
                      >
                        ✦ Featured
                      </span>
                    </div>
                    <div style={{ boxShadow: '0 0 24px rgba(255,184,0,0.18)' }}>
                      <EventCard event={ev} initialSaved={savedIds.has(ev.id)} />
                    </div>
                  </motion.div>
                ))}

                {/* Regular events — stagger as they enter viewport */}
                {regular.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    custom={featured.length + i}
                    variants={cardVariants}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: '-30px' }}
                  >
                    <EventCard event={ev} initialSaved={savedIds.has(ev.id)} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
