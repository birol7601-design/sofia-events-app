import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const GENRES = ['Electronic', 'Jazz', 'Rock', 'Pop', 'Classical', 'Techno', 'House', 'Festival', 'Hip-Hop', 'R&B'];

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-10"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-accent/10 blur-3xl -z-10" />
      <h2 className="font-display font-bold text-2xl text-text mb-2 text-center">What music moves you?</h2>
      <p className="text-textMuted text-sm mb-8 text-center font-body">Pick your genres and we'll personalise your feed.</p>
      <div className="flex flex-wrap gap-2 justify-center max-w-sm mb-10">
        {GENRES.map(g => (
          <button key={g}
            className="glass rounded-full px-4 py-2 text-sm text-textMuted font-semibold font-body hover:text-text hover:border-primary/50 transition-colors">
            {g}
          </button>
        ))}
      </div>
      <Button onClick={() => navigate('/')}>Let's go →</Button>
    </motion.div>
  );
}
