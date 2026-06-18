import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import BuzzSays from '../components/BuzzSays';
import { EventCardSkeleton } from '../components/Skeleton';
import { apiGet } from '../lib/api';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function Feed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    apiGet('/api/events')
      .then(setEvents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(events.map(e => e.category).filter(Boolean))];
  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-20"
    >
      <div className="pt-6 px-4 pb-3">
        <h1 className="font-display font-bold text-2xl text-text">Events</h1>
        <p className="text-textMuted text-sm font-body">What's on in Sofia</p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
        {categories.map(cat => (
          <button key={cat}
            onClick={() => setFilter(cat)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold font-body transition-colors duration-150 ${
              filter === cat
                ? 'bg-primary text-white'
                : 'glass text-textMuted hover:text-text'
            }`}
          >
            {cat === 'all' ? '🎉 All' : cat}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2 flex-1">
        <BuzzSays page="feed" />
        {loading && [0,1,2,3].map(i => <EventCardSkeleton key={i} />)}
        {error   && <p className="text-accent text-sm text-center py-10">{error}</p>}
        {!loading && !error && filtered.map(ev => <EventCard key={ev.id} event={ev} />)}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-textMuted text-sm text-center py-10">No events found.</p>
        )}
      </div>
    </motion.div>
  );
}
