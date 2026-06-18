import { motion } from 'framer-motion';
import BuzzSays from '../components/BuzzSays';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function Messages() {
  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-20 comb-bg"
    >
      <div className="pt-10 px-5 pb-3">
        <h1 className="font-display font-bold text-2xl" style={{ color: '#FFF4D6' }}>Съобщения</h1>
        <p className="text-sm font-body" style={{ color: '#8A7B4A' }}>Чат с приятели</p>
      </div>
      <div className="px-5">
        <BuzzSays page="messages" />

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div
            className="juicy-hex opacity-25"
            style={{ width: 64, height: 72, fontSize: 28 }}
          >
            🐝
          </div>
          <p className="font-display font-semibold text-base" style={{ color: '#C7B68A' }}>
            Кошерът мълчи.
          </p>
          <p className="text-sm font-body text-center max-w-xs" style={{ color: '#8A7B4A' }}>
            Добави приятели от профила си, за да започнеш разговор.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
