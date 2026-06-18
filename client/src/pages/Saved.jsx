import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import BuzzSays from '../components/BuzzSays';
import { apiGet } from '../lib/api';
import { getUser } from '../lib/auth';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function Saved() {
  const [tab, setTab] = useState('saved');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = getUser();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGet(`/api/users/${id}/${tab}`)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [tab, id]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-20"
    >
      <div className="pt-6 px-4 pb-3">
        <h1 className="font-display font-bold text-2xl text-text">Collection</h1>
        <p className="text-textMuted text-sm font-body">Your personal nights</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 pb-3">
        {['saved','attending'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold font-body transition-colors ${
              tab === t ? 'bg-primary text-white' : 'glass text-textMuted'
            }`}>
            {t === 'saved' ? '🔖 Saved' : '🎪 Attending'}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2 flex-1">
        <BuzzSays page="saved" />
        {loading && <p className="text-textMuted text-sm text-center py-10">Loading…</p>}
        {!loading && events.length === 0 && (
          <p className="text-textMuted text-sm text-center py-10">
            {tab === 'saved' ? 'No saved events yet. Tap ♥ on any event.' : 'Not attending any events yet.'}
          </p>
        )}
        {!loading && events.map(ev => <EventCard key={ev.id} event={ev} />)}
      </div>
    </motion.div>
  );
}
