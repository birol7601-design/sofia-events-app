import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import BuzzSays from '../components/BuzzSays';
import { apiGet } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const statVariants = {
  initial: { opacity: 0, y: 14 },
  animate: i => ({ opacity: 1, y: 0, transition: { delay: 0.12 + i * 0.07, duration: 0.35, ease: [0.16,1,0.3,1] } }),
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile,        setProfile]        = useState(null);
  const [savedCount,     setSavedCount]     = useState('—');
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
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-24 comb-bg"
    >
      {/* Hero banner */}
      <div
        className="relative h-36 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 140% at 35% 20%, #FFF7C0 0%, #FFE45C 28%, #FFB800 58%, #D87A00 100%)' }}
      >
        <div className="absolute inset-0 comb-bg opacity-30" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(10,6,0,0.85) 100%)' }} />
      </div>

      {/* Avatar — overlaps hero bottom */}
      <div className="px-5 -mt-10 relative z-10">
        <div
          className="juicy-hex"
          style={{
            width: 74, height: 74,
            filter: 'drop-shadow(0 0 14px rgba(255,184,0,0.55))',
          }}
        >
          <Avatar type={user?.avatarType} size={62} name={user?.name} />
        </div>
      </div>

      <div className="px-5 pt-3 space-y-4">
        {/* Name + bio */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }}>
          <h2 className="font-display font-bold text-xl" style={{ color: '#FFF4D6' }}>
            {user?.name || 'You'}
          </h2>
          <p className="text-sm font-body" style={{ color: '#8A7B4A' }}>
            {profile?.bio || 'Без биография засега.'}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Запазени',  value: savedCount },
            { label: 'Отивам',    value: attendingCount },
          ].map(({ label, value }, i) => (
            <motion.div
              key={label}
              custom={i}
              variants={statVariants}
              initial="initial"
              animate="animate"
              className="gloss-card rounded-2xl text-center py-4"
            >
              <p className="font-bold text-2xl font-display" style={{ color: '#FFB800' }}>{value}</p>
              <p className="text-[10px] uppercase tracking-widest font-body" style={{ color: '#8A7B4A' }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* BuzzSays */}
        <BuzzSays page="profile" />

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => navigate('/saved')}>
            Запазени
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Изход
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
