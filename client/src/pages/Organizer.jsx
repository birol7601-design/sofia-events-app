import { motion } from 'framer-motion';
import BuzzSays from '../components/BuzzSays';
import GlassCard from '../components/GlassCard';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function Organizer() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-20 px-4"
    >
      <div className="pt-6 pb-3">
        <h1 className="font-display font-bold text-2xl text-text">For Organizers</h1>
        <p className="text-textMuted text-sm font-body">List your events. Reach your audience.</p>
      </div>
      <BuzzSays page="organizer" />
      <GlassCard className="space-y-3 mt-2">
        {[['⭐','Free listings','Add unlimited events to the SofiaBuzz feed'],
          ['🔥','Featured placement','Promote to the top of the feed from €35 for 7 days'],
          ['📊','Audience insights','See how many people viewed your event'],
          ['🎯','Direct reach','Reach thousands of Sofia locals']].map(([icon, title, sub]) => (
          <div key={title} className="flex gap-3 items-start">
            <span className="text-lg">{icon}</span>
            <div>
              <p className="text-text text-sm font-semibold font-display">{title}</p>
              <p className="text-textMuted text-xs font-body">{sub}</p>
            </div>
          </div>
        ))}
      </GlassCard>
      <p className="text-textMuted text-xs mt-6 text-center font-body">
        Full organizer dashboard coming soon — or log in at the existing portal.
      </p>
    </motion.div>
  );
}
