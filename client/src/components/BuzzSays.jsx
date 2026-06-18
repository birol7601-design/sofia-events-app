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
          className={`glass-accent rounded-xl px-4 py-3 mb-3 ${className}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[2px] mb-1"
            style={{ color: '#FB923C' }}>
            BUZZ КАЗВА
          </p>
          <p className="text-text/85 text-sm italic leading-relaxed font-body">{comment}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
