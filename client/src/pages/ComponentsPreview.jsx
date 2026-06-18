import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import EventCard from '../components/EventCard';
import Marquee from '../components/Marquee';
import BuzzSays from '../components/BuzzSays';
import Avatar from '../components/Avatar';
import { EventCardSkeleton, ListItemSkeleton, TextSkeleton } from '../components/Skeleton';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const SECTION = ({ title, children }) => (
  <section className="mb-10">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-primaryLight text-[10px] font-bold uppercase tracking-[3px] font-body">{title}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(167,139,250,0.15)' }} />
    </div>
    {children}
  </section>
);

const MOCK_EVENT = {
  id: 1,
  title: 'Scorpions — Coming Home Tour',
  venue: 'Arena Sofia',
  category: 'Rock',
  start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  price_text: 'from €45',
  image_url: null,
};

const MOCK_EVENT_2 = {
  id: 2,
  title: 'Sofia Live Festival 2026',
  venue: 'NDK Park',
  category: 'Festival',
  start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  price_text: 'from €25',
  image_url: null,
};

export default function ComponentsPreview() {
  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="pb-28"
    >
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <p className="text-textMuted text-xs uppercase tracking-widest mb-2 font-body">SofiaBuzz</p>
        <h1 className="font-display font-bold text-3xl text-gradient mb-1">Design System</h1>
        <p className="text-textMuted text-sm font-body">Phase 2 — all polished components</p>
      </div>

      {/* Marquee */}
      <SECTION title="Marquee">
        <Marquee />
      </SECTION>

      <div className="px-5 space-y-0">

        {/* GlassCard */}
        <SECTION title="GlassCard">
          <div className="space-y-3">
            <GlassCard>
              <p className="text-text font-display font-semibold">Default GlassCard</p>
              <p className="text-textMuted text-sm font-body mt-1">Frosted surface with top highlight and depth shadow</p>
            </GlassCard>
            <GlassCard glow="primary" onClick={() => {}}>
              <p className="text-text font-display font-semibold">Interactive + Primary Glow</p>
              <p className="text-textMuted text-sm font-body mt-1">Hover me ↑ — lifts 4px with purple glow, border brightens</p>
            </GlassCard>
            <GlassCard glow="accent" onClick={() => {}}>
              <p className="text-text font-display font-semibold">Interactive + Accent Glow</p>
              <p className="text-textMuted text-sm font-body mt-1">Hover me ↑ — lifts with pink/accent glow</p>
            </GlassCard>
          </div>
        </SECTION>

        {/* Buttons */}
        <SECTION title="Buttons">
          <div className="flex flex-wrap gap-3 mb-3">
            <Button variant="primary">Primary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </SECTION>

        {/* Event Cards */}
        <SECTION title="EventCard">
          <div className="space-y-3">
            <EventCard event={MOCK_EVENT} attendingCount={47} />
            <EventCard event={MOCK_EVENT_2} attendingCount={12} />
          </div>
        </SECTION>

        {/* Avatars */}
        <SECTION title="Avatars — 8 types">
          <GlassCard>
            <div className="flex flex-wrap gap-4 justify-center">
              {['star','crown','moon','diamond','flame','compass','eye','vinyl'].map(type => (
                <div key={type} className="flex flex-col items-center gap-2">
                  <Avatar type={type} size={52} />
                  <span className="text-textMuted text-[10px] font-body">{type}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              <div className="flex flex-col items-center gap-2">
                <Avatar type="star" size={52} ring />
                <span className="text-textMuted text-[10px] font-body">with ring</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar type="crown" size={52} name="Birol" />
                <span className="text-textMuted text-[10px] font-body">with initial</span>
              </div>
              <div className="flex gap-1 items-end">
                {[24,32,44,56].map(s => <Avatar key={s} type="flame" size={s} />)}
              </div>
            </div>
          </GlassCard>
        </SECTION>

        {/* BuzzSays */}
        <SECTION title="BuzzSays">
          <BuzzSays page="feed" />
          <div
            className="glass-accent rounded-xl px-4 py-3"
            style={{ border: '1px solid rgba(124,58,237,0.28)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[2px] mb-1" style={{ color: '#FB923C' }}>BUZZ КАЗВА</p>
            <p className="text-text/85 text-sm italic font-body">Тази седмица има повече събития отколкото имаш пари. Класика.</p>
          </div>
        </SECTION>

        {/* Skeletons */}
        <SECTION title="Skeleton / Loading States">
          <div className="space-y-3">
            <p className="text-textMuted text-xs font-body mb-1">EventCard skeleton</p>
            <EventCardSkeleton />
            <p className="text-textMuted text-xs font-body mt-2 mb-1">List item skeletons</p>
            <ListItemSkeleton />
            <ListItemSkeleton />
            <p className="text-textMuted text-xs font-body mt-2 mb-1">Text skeleton</p>
            <GlassCard>
              <TextSkeleton lines={4} />
            </GlassCard>
          </div>
        </SECTION>

        {/* Typography */}
        <SECTION title="Typography">
          <GlassCard className="space-y-3">
            <p className="font-display font-bold text-4xl text-gradient">Display Bold 36px</p>
            <p className="font-display font-semibold text-2xl text-text">Display Semibold 24px</p>
            <p className="font-display text-lg text-text/80">Display Regular 18px</p>
            <div className="h-px" style={{ background: 'rgba(167,139,250,0.15)' }} />
            <p className="font-body text-text text-base">Body Regular — Inter 16px for reading</p>
            <p className="font-body text-textMuted text-sm">Body Muted — supporting info, captions</p>
            <p className="font-body text-textMuted text-xs uppercase tracking-widest">Label • Uppercase • Tracked</p>
            <div className="h-px" style={{ background: 'rgba(167,139,250,0.15)' }} />
            <p className="text-gradient text-2xl font-bold font-display">Purple → Pink Gradient</p>
            <p className="text-gradient-warm text-2xl font-bold font-display">Pink → Warm Gradient</p>
          </GlassCard>
        </SECTION>

        {/* Colours */}
        <SECTION title="Palette">
          <div className="grid grid-cols-4 gap-2">
            {[
              ['#0D0A1A','bg'],['#16122B','surface'],['#1E1838','surface2'],
              ['#7C3AED','primary'],['#A78BFA','primaryLight'],
              ['#EC4899','accent'],['#FB923C','accentWarm'],
              ['#F5F3FF','text'],['#A39CC4','textMuted'],
            ].map(([color, label]) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="w-full aspect-square rounded-xl border border-white/10"
                  style={{ background: color }} />
                <span className="text-textMuted text-[9px] font-body text-center">{label}</span>
              </div>
            ))}
          </div>
        </SECTION>

      </div>
    </motion.div>
  );
}
