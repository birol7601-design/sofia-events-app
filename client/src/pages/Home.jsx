import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../lib/api';
import { getUser, isLoggedIn } from '../lib/auth';
import EventCard from '../components/EventCard';
import BuzzSays from '../components/BuzzSays';
import Marquee from '../components/Marquee';
import Logo from '../components/Logo';
import { EventCardSkeleton } from '../components/Skeleton';

const GENRES = ['Rock', 'Pop', 'Jazz', 'Electronic', 'Festival', 'House', 'Techno', 'Classical'];

function greeting(name) {
  const h = new Date().getHours();
  const g = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${g}${name ? `, ${name}` : ''}`;
}

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.38, staggerChildren: 0.07 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.44, ease: [0.16, 1, 0.3, 1] } },
};

export default function Home() {
  const navigate = useNavigate();
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [genreFilter, setGenre] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const user = getUser();

  useEffect(() => {
    apiGet('/api/events')
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
    if (isLoggedIn()) {
      apiGet('/api/users/saved/ids')
        .then(d => setSavedIds(new Set(d?.savedIds || [])))
        .catch(() => {});
    }
  }, []);

  const highlights    = events.slice(0, 8);
  const genreFiltered = genreFilter
    ? events.filter(e => e.category?.toLowerCase() === genreFilter.toLowerCase())
    : [];

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-24 overflow-x-hidden comb-bg"
    >
      {/* Header: Logo + greeting + avatar */}
      <motion.div variants={itemVariants} className="flex items-center justify-between px-5 pt-12 pb-2">
        <div className="flex items-center gap-3">
          <Logo size={42} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[3px] font-body mb-0"
              style={{ color: '#8A7B4A' }}>
              join the hive
            </p>
            <h1 className="font-display font-bold text-xl leading-tight" style={{ color: '#FFF4D6' }}>
              {greeting(user.name)}
            </h1>
          </div>
        </div>
        {isLoggedIn() && (
          <motion.button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(ellipse 80% 140% at 35% 20%, #FFE45C 0%, #FFB800 55%, #C46A00 100%)',
              boxShadow: '0 0 16px rgba(255,184,0,0.4)',
            }}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.06 }}
          >
            <span style={{ color: '#7A3D00', fontFamily: '"Sora", sans-serif', fontWeight: 800, fontSize: 14 }}>
              {user.name?.[0]?.toUpperCase() || '?'}
            </span>
          </motion.button>
        )}
      </motion.div>

      {/* Slogan */}
      <motion.div variants={itemVariants} className="px-5 pb-1">
        <p className="text-xs font-body" style={{ color: '#8A7B4A' }}>Catch the buzz. Sofia's nightlife hive.</p>
      </motion.div>

      {/* Marquee */}
      <motion.div variants={itemVariants} className="mt-3">
        <Marquee />
      </motion.div>

      {/* Upcoming — horizontal scroll */}
      <motion.section variants={itemVariants} className="mt-7">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="font-display font-bold text-lg" style={{ color: '#FFF4D6' }}>Upcoming</h2>
          <button
            onClick={() => navigate('/feed')}
            className="text-[12px] font-body"
            style={{ color: '#FFB800' }}
          >
            See all →
          </button>
        </div>

        <div className="flex gap-3 px-5 overflow-x-auto scrollbar-none pb-1">
          {loading
            ? [0, 1, 2].map(i => (
                <div key={i} className="w-64 flex-shrink-0"><EventCardSkeleton /></div>
              ))
            : highlights.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  className="w-64 flex-shrink-0"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.12 + i * 0.055, duration: 0.38, ease: 'easeOut' } }}
                >
                  <EventCard event={ev} initialSaved={savedIds.has(ev.id)} />
                </motion.div>
              ))
          }
        </div>
      </motion.section>

      {/* Genre pills */}
      <motion.section variants={itemVariants} className="mt-7 px-5">
        <h2 className="font-display font-bold text-lg mb-3" style={{ color: '#FFF4D6' }}>Browse by genre</h2>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(g => {
            const active = genreFilter === g;
            return (
              <motion.button
                key={g}
                onClick={() => setGenre(active ? null : g)}
                className="rounded-full px-4 py-1.5 text-xs font-semibold font-body"
                style={{
                  background: active
                    ? 'radial-gradient(ellipse 80% 140% at 35% 20%, #FFE45C 0%, #FFB800 55%, #C46A00 100%)'
                    : 'rgba(28,23,8,0.85)',
                  border: active ? '1px solid rgba(255,184,0,0.5)' : '1px solid rgba(255,184,0,0.15)',
                  color: active ? '#7A3D00' : '#C7B68A',
                  fontWeight: active ? 800 : 600,
                  boxShadow: active ? '0 0 14px rgba(255,184,0,0.3)' : 'none',
                }}
                whileTap={{ scale: 0.91 }}
              >
                {g}
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* Genre results */}
      {genreFilter && (
        <motion.section
          className="px-5 mt-5 space-y-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.32 } }}
        >
          <h2 className="font-display font-semibold text-base" style={{ color: '#FFF4D6' }}>{genreFilter} events</h2>
          {genreFiltered.length === 0
            ? <p className="text-sm py-4 font-body" style={{ color: '#8A7B4A' }}>No {genreFilter} events right now.</p>
            : genreFiltered.map(ev => <EventCard key={ev.id} event={ev} initialSaved={savedIds.has(ev.id)} />)
          }
        </motion.section>
      )}

      {/* BuzzSays */}
      <motion.div variants={itemVariants} className="px-5 mt-6">
        <BuzzSays page="home" />
      </motion.div>

      {/* Explore grid */}
      {!genreFilter && (
        <motion.section variants={itemVariants} className="px-5 mt-6">
          <h2 className="font-display font-bold text-lg mb-3" style={{ color: '#FFF4D6' }}>Explore the hive</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'All Events', icon: '🎉', path: '/feed'      },
              { label: 'Saved',      icon: '🔖', path: '/saved'     },
              { label: 'Organizers', icon: '🎭', path: '/organizer' },
              { label: 'Profile',    icon: '👤', path: '/profile'   },
            ].map(({ label, icon, path }) => (
              <motion.div
                key={path}
                onClick={() => navigate(path)}
                className="gloss-card rounded-2xl p-4 cursor-pointer flex flex-col gap-2"
                whileHover={{ y: -3, borderColor: 'rgba(255,184,0,0.38)' }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="text-2xl">{icon}</span>
                <span className="font-display font-semibold text-sm" style={{ color: '#FFF4D6' }}>{label}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
