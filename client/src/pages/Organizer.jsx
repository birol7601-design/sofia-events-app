import { motion } from 'framer-motion';
import BuzzSays from '../components/BuzzSays';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const FEATURES = [
  ['⭐', 'Безплатни обяви',     'Добавяй неограничено събития в SofiaBuzz'],
  ['🔥', 'Промотирано място',   'Изведи събитието до топа на фийда от €35 за 7 дни'],
  ['📊', 'Аудитория и статистики', 'Виж колко хора са видели събитието ти'],
  ['🎯', 'Директен обхват',     'Достигни хиляди локали в София'],
];

export default function Organizer() {
  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-20 px-5 comb-bg"
    >
      <div className="pt-10 pb-3">
        <h1 className="font-display font-bold text-2xl" style={{ color: '#FFF4D6' }}>Организатори</h1>
        <p className="text-sm font-body" style={{ color: '#8A7B4A' }}>Обяви събитие. Достигни публиката си.</p>
      </div>

      <BuzzSays page="feed" />

      <div className="gloss-card rounded-2xl p-4 space-y-4 mt-2">
        {FEATURES.map(([icon, title, sub]) => (
          <div key={title} className="flex gap-3 items-start">
            <span className="text-xl leading-none mt-0.5">{icon}</span>
            <div>
              <p className="text-sm font-semibold font-display" style={{ color: '#FFF4D6' }}>{title}</p>
              <p className="text-xs font-body" style={{ color: '#C7B68A' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs mt-6 text-center font-body" style={{ color: '#8A7B4A' }}>
        Пълен организаторски панел — очаквайте скоро, или влезте в съществуващия портал.
      </p>
    </motion.div>
  );
}
