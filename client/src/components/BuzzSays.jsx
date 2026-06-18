import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

export default function BuzzSays({ page, className = '' }) {
  const [comment, setComment] = useState(null);

  useEffect(() => {
    const lang = localStorage.getItem('lang') || 'bg';
    apiGet(`/api/buzz-says/${page}`)
      .then(d => {
        if (!d) return;
        setComment(lang === 'bg' ? (d.comment_bg || d.comment_en) : (d.comment_en || d.comment_bg));
      })
      .catch(() => {});
  }, [page]);

  return (
    <AnimatePresence>
      {comment && (
        <motion.div
          key="buzz"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`rounded-xl px-4 py-3 mb-3 flex items-start gap-3 ${className}`}
          style={{
            background: 'rgba(255,184,0,0.07)',
            border: '1px solid rgba(255,184,0,0.18)',
            borderLeft: '3px solid #FFB800',
          }}
        >
          {/* Tiny hex bee icon */}
          <div
            className="flex-shrink-0 mt-0.5"
            style={{
              width: 22, height: 25,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: 'radial-gradient(ellipse 80% 140% at 35% 20%, #FFE45C 0%, #FFB800 55%, #C46A00 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11,
            }}
          >
            🐝
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[2px] mb-0.5 font-body"
              style={{ color: '#FFB800' }}>
              BUZZ КАЗВА
            </p>
            <p className="text-sm italic leading-relaxed font-body" style={{ color: '#FFF4D6', opacity: 0.85 }}>
              {comment}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
