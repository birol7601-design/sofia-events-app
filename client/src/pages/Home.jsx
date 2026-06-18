import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Marquee from '../components/Marquee';
import BuzzSays from '../components/BuzzSays';

const MARQUEE_ITEMS = ['Electronic', 'Jazz', 'Rock', 'Festival', 'Pop', 'Techno', 'Classical', 'House'];

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-20"
    >
      {/* Hero wordmark */}
      <div className="relative pt-12 pb-6 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-[56px] leading-none tracking-tight text-gradient select-none"
        >
          Buzz
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="text-textMuted text-base mt-2 font-body"
        >
          Find your night in Sofia
        </motion.p>

        {/* Glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10" />
      </div>

      {/* Marquee ticker */}
      <Marquee items={MARQUEE_ITEMS} />

      {/* Content */}
      <div className="flex-1 px-4 pt-4 space-y-3">
        <BuzzSays page="home" />

        {/* Explore card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <GlassCard
            onClick={() => navigate('/feed')}
            className="flex items-center gap-4 shadow-glow"
          >
            <div className="w-12 h-12 rounded-xl bg-hero-gradient flex items-center justify-center text-2xl flex-shrink-0 shadow-glow">
              🎉
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text font-semibold font-display">All Events</p>
              <p className="text-textMuted text-sm font-body">Browse the full Sofia feed</p>
            </div>
            <span className="text-primaryLight text-2xl">›</span>
          </GlassCard>
        </motion.div>

        {/* Quick-access grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { icon: '🔖', title: 'Saved',      sub: 'Your favourites',   to: '/saved'     },
            { icon: '💬', title: 'Messages',   sub: 'Chat with friends', to: '/messages'  },
            { icon: '👤', title: 'Profile',    sub: 'Your account',      to: '/profile'   },
            { icon: '🎭', title: 'Organizers', sub: 'List your event',   to: '/organizer' },
          ].map(({ icon, title, sub, to }) => (
            <GlassCard key={to} onClick={() => navigate(to)} className="text-center py-5">
              <span className="text-3xl">{icon}</span>
              <p className="text-text text-sm font-semibold mt-2 font-display">{title}</p>
              <p className="text-textMuted text-xs font-body">{sub}</p>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
