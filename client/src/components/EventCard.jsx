import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';

const CAT_COLORS = {
  rock:       '#7C3AED', pop: '#EC4899', jazz: '#FB923C',
  electronic: '#3B82F6', techno: '#3B82F6', house: '#06B6D4',
  festival:   '#10B981', classical: '#8B5CF6', default: '#4B5563',
};

function catColor(cat = '') {
  return CAT_COLORS[(cat || '').toLowerCase()] || CAT_COLORS.default;
}

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const date = event.start_time
    ? new Date(event.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '';
  const time = event.start_time
    ? new Date(event.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '';
  const color = catColor(event.category);

  return (
    <GlassCard onClick={() => navigate(`/event/${event.id}`)} className="flex gap-3 items-center">
      <div
        style={{ background: color }}
        className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-white/70 text-xs font-bold uppercase tracking-wide"
      >
        {(event.category || '?')[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text font-semibold text-sm truncate font-display">{event.title}</p>
        <p className="text-textMuted text-xs mt-0.5 truncate">{event.venue}{date ? ` · ${date}, ${time}` : ''}</p>
      </div>
      <span className="text-primaryLight text-lg flex-shrink-0">›</span>
    </GlassCard>
  );
}
