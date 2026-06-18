import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { apiGet } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [savedCount, setSavedCount] = useState('—');
  const [attendingCount, setAttendingCount] = useState('—');

  useEffect(() => {
    if (!user?.id) return;
    apiGet('/api/users/me').then(setProfile).catch(() => {});
    apiGet(`/api/users/${user.id}/saved`).then(d => setSavedCount(d.length)).catch(() => {});
    apiGet(`/api/users/${user.id}/attending`).then(d => setAttendingCount(d.length)).catch(() => {});
  }, [user?.id]);

  function handleLogout() {
    logout();
    navigate('/auth');
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-24"
    >
      {/* Hero */}
      <div className="relative h-32 bg-hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/20 text-7xl font-display font-bold select-none">✦</span>
        </div>
      </div>

      {/* Avatar */}
      <div className="px-5 -mt-9 relative z-10">
        <div className="w-[72px] h-[72px] rounded-full p-[2px] bg-hero-gradient shadow-glow">
          <div className="w-full h-full rounded-full bg-bg flex items-center justify-center overflow-hidden">
            <Avatar type={user?.avatarType} size={66} name={user?.name} />
          </div>
        </div>
      </div>

      <div className="px-5 pt-3 space-y-4">
        <div>
          <h2 className="font-display font-bold text-xl text-text">{user?.name || 'You'}</h2>
          <p className="text-textMuted text-sm font-body">{profile?.bio || 'No bio yet.'}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="text-center py-3">
            <p className="text-primaryLight font-bold text-2xl font-display">{savedCount}</p>
            <p className="text-textMuted text-xs uppercase tracking-widest font-body">Saved</p>
          </GlassCard>
          <GlassCard className="text-center py-3">
            <p className="text-primaryLight font-bold text-2xl font-display">{attendingCount}</p>
            <p className="text-textMuted text-xs uppercase tracking-widest font-body">Attending</p>
          </GlassCard>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => navigate('/saved')}>My saved events</Button>
          <Button variant="danger" onClick={handleLogout}>Log out</Button>
        </div>
      </div>
    </motion.div>
  );
}
