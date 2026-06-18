import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { apiGet, apiPost, apiDelete } from '../lib/api';
import { isLoggedIn } from '../lib/auth';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [saved, setSaved] = useState(false);
  const [attending, setAttending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet(`/api/events/${id}`),
      isLoggedIn() ? apiGet('/api/users/me') : null,
    ]).then(([ev]) => {
      setEvent(ev);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const date = event?.start_time
    ? new Date(event.start_time).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : '';
  const time = event?.start_time
    ? new Date(event.start_time).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
    : '';

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="flex flex-col min-h-dvh pb-28"
    >
      {/* Back */}
      <div className="px-4 pt-5 pb-3">
        <button onClick={() => navigate(-1)}
          className="glass rounded-full w-10 h-10 flex items-center justify-center text-primaryLight hover:bg-primary/20 transition-colors">
          ←
        </button>
      </div>

      {loading && <p className="text-textMuted text-center py-20">Loading…</p>}

      {event && (
        <div className="px-4 space-y-4">
          {/* Category badge */}
          <span className="inline-block glass-accent text-primaryLight text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            {event.category}
          </span>

          <h1 className="font-display font-bold text-2xl text-text leading-tight">{event.title}</h1>

          <GlassCard>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-textMuted text-[10px] uppercase tracking-widest mb-1">Venue</p>
                <p className="text-text text-sm font-semibold">{event.venue}</p>
              </div>
              <div className="flex-1">
                <p className="text-textMuted text-[10px] uppercase tracking-widest mb-1">Date &amp; Time</p>
                <p className="text-text text-sm font-semibold">{date}</p>
                <p className="text-textMuted text-xs">{time}</p>
              </div>
            </div>
          </GlassCard>

          {event.description && (
            <GlassCard>
              <p className="text-textMuted text-[10px] uppercase tracking-widest mb-2">About</p>
              <p className="text-text/80 text-sm leading-relaxed">{event.description}</p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Sticky bottom bar */}
      {event && (
        <div className="fixed bottom-16 left-0 right-0 glass border-t border-primary/20 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSaved(s => !s)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
              saved ? 'border-accent bg-accent/20 text-accent' : 'border-primary/40 text-textMuted'
            }`}>
            ♥
          </button>
          <div className="flex-1">
            <p className="text-textMuted text-[10px]">from</p>
            <p className="text-text font-bold font-display">{event.price_text || 'Free'}</p>
          </div>
          <Button onClick={() => setAttending(a => !a)} variant={attending ? 'ghost' : 'primary'}>
            {attending ? 'Going ✓' : "I'm going"}
          </Button>
          {event.ticket_url && (
            <a href={event.ticket_url} target="_blank" rel="noopener"
              className="text-xs text-primaryLight underline underline-offset-2">
              Tickets ↗
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}
