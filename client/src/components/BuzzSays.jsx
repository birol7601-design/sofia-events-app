import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

const LOCAL_LINES = {
  home:     'Програмата за седмицата е по-пълна от сметката ти. Но карай.',
  feed:     'Филтрираш по жанр все едно имаш стандарти. Мило.',
  profile:  'Резидент на дансинга. Без диплома, но с пълно присъствие.',
  saved:    'Запазваш събития както запазваш чувства. И на двете не отиваш.',
  messages: 'Кошерът мълчи. Като чатовете ти в неделя сутрин.',
  event:    'Хората, които виждат живо, не питат после как е минало.',
};

export default function BuzzSays({ page, className = '' }) {
  const [comment, setComment] = useState(null);

  useEffect(() => {
    const lang = localStorage.getItem('lang') || 'bg';
    setComment(LOCAL_LINES[page] || null);
    apiGet(`/api/buzz-says/${page}`)
      .then(d => {
        if (!d) return;
        const line = lang === 'bg' ? (d.comment_bg || d.comment_en) : (d.comment_en || d.comment_bg);
        if (line) setComment(line);
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
            background: 'linear-gradient(100deg, rgba(255,184,0,0.15), rgba(255,184,0,0.04))',
            border: '1px solid rgba(255,184,0,0.24)',
            borderLeft: '3px solid #FFB800',
            borderRadius: 18,
          }}
        >
          {/* Glossy hex bee icon */}
          <div
            className="flex-shrink-0 mt-0.5 juicy-hex"
            style={{ width: 22, height: 25, fontSize: 11, borderRadius: 0 }}
          >
            🐝
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[2px] mb-0.5 font-body"
              style={{ color: '#FFB800' }}>
              Buzz казва:
            </p>
            <p className="text-sm leading-relaxed font-body" style={{ color: '#E8D49A', fontStyle: 'italic' }}>
              {comment}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
