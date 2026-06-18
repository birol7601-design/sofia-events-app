import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

export default function BuzzSays({ page }) {
  const [comment, setComment] = useState(null);

  useEffect(() => {
    apiGet(`/api/buzz-says/${page}`)
      .then(d => setComment(d?.comment_en || d?.comment_bg || null))
      .catch(() => {});
  }, [page]);

  if (!comment) return null;

  return (
    <div className="glass-accent rounded-xl px-4 py-3 mx-0 mb-3">
      <p className="text-primaryLight text-[10px] font-bold uppercase tracking-widest mb-1">BUZZ SAYS</p>
      <p className="text-text/80 text-sm italic">{comment}</p>
    </div>
  );
}
