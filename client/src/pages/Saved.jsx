import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import BuzzSays from '../components/BuzzSays';
import { EventCardSkeleton } from '../components/Skeleton';
import { apiGet } from '../lib/api';
import { isLoggedIn } from '../lib/auth';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function Saved() {
  const [tab,             setTab]             = useState('saved');
  const [savedEvents,     setSavedEvents]     = useState([]);
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      apiGet('/api/events'),
      apiGet('/api/users/saved/ids'),
      apiGet('/api/users/attending/ids'),
    ])
      .then(([allEvents, savedData, attendingData]) => {
        const savedSet     = new Set(savedData?.savedIds || []);
        const attendingSet = new Set(attendingData?.attendingIds || []);
        setSavedEvents(allEvents.filter(e => savedSet.has(e.id)));
        setAttendingEvents(allEvents.filter(e => attendingSet.has(e.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave    = (eventId) => setSavedEvents(prev => prev.filter(e => e.id !== eventId));
  const handleUnattend  = (eventId) => setAttendingEvents(prev => prev.filter(e => e.id !== eventId));

  const shown = tab === 'saved' ? savedEvents : attendingEvents;

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-24 comb-bg"
    >
      {/* Header */}
      <div className="pt-10 px-5 pb-3">
        <h1 className="font-display font-bold text-2xl" style={{ color: '#FFF4D6' }}>Collection</h1>
        <p className="text-sm font-body" style={{ color: '#8A7B4A' }}>Your personal hive</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 pb-4">
        {[
          { id: 'saved',     label: '🔖 Saved',    count: savedEvents.length     },
          { id: 'attending', label: '🐝 Attending', count: attendingEvents.length },
        ].map(({ id, label, count }) => (
          <motion.button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold font-body"
            style={{
              background: tab === id
                ? 'radial-gradient(ellipse 80% 140% at 35% 20%, #FFE45C 0%, #FFB800 55%, #C46A00 100%)'
                : 'rgba(28,23,8,0.85)',
              border: tab === id
                ? '1px solid rgba(255,184,0,0.5)'
                : '1px solid rgba(255,184,0,0.15)',
              color: tab === id ? '#7A3D00' : '#C7B68A',
              fontWeight: tab === id ? 800 : 600,
              boxShadow: tab === id ? '0 0 14px rgba(255,184,0,0.3)' : 'none',
            }}
            whileTap={{ scale: 0.91 }}
          >
            {label}
            {!loading && count > 0 && (
              <span
                className="rounded-full text-[10px] px-1.5 py-0.5 leading-none font-bold"
                style={{
                  background: tab === id ? 'rgba(122,61,0,0.25)' : 'rgba(255,184,0,0.12)',
                  color:      tab === id ? '#7A3D00' : '#FFB800',
                }}
              >
                {count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 flex-1">
        <BuzzSays page="saved" />

        {loading && (
          <div className="space-y-3 mt-4">
            {[0, 1, 2].map(i => <EventCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && !isLoggedIn() && (
          <p className="text-sm text-center py-12 font-body" style={{ color: '#8A7B4A' }}>
            Sign in to see your collection.
          </p>
        )}

        {!loading && isLoggedIn() && (
          <div className="mt-3">
            <AnimatePresence mode="popLayout">
              {shown.length === 0 ? (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-sm text-center py-12 font-body"
                  style={{ color: '#8A7B4A' }}
                >
                  {tab === 'saved'
                    ? 'No saved events yet. Tap ♥ on any event.'
                    : 'Not attending any events yet.'}
                </motion.p>
              ) : (
                shown.map(ev => (
                  <motion.div
                    key={ev.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } }}
                    exit={{ opacity: 0, x: -48, scale: 0.95, transition: { duration: 0.26 } }}
                    className="mb-3"
                  >
                    {tab === 'saved' ? (
                      <EventCard
                        event={ev}
                        initialSaved={true}
                        onSaveChange={(id, isSaved) => { if (!isSaved) handleUnsave(id); }}
                      />
                    ) : (
                      <EventCard
                        event={ev}
                        initialAttending={true}
                        onAttendChange={(id, isAttending) => { if (!isAttending) handleUnattend(id); }}
                      />
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
