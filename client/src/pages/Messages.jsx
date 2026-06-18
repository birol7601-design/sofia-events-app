import { motion } from 'framer-motion';
import BuzzSays from '../components/BuzzSays';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function Messages() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-20"
    >
      <div className="pt-6 px-4 pb-3">
        <h1 className="font-display font-bold text-2xl text-text">Messages</h1>
        <p className="text-textMuted text-sm font-body">Chat with your friends</p>
      </div>
      <div className="px-4">
        <BuzzSays page="messages" />
        <p className="text-textMuted text-sm text-center py-16">No conversations yet. Add friends on your profile to start chatting.</p>
      </div>
    </motion.div>
  );
}
