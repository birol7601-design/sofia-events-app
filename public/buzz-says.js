(async function initBuzzSays() {
  const el = document.getElementById('buzz-says-bar');
  if (!el) return;
  const page = el.dataset.page || 'feed';
  const context = el.dataset.context || '';
  try {
    const url = `https://sofiabuzz.com/api/buzz-says/${encodeURIComponent(page)}${context ? `?context=${encodeURIComponent(context)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) { el.style.display = 'none'; return; }
    const data = await res.json();
    if (!data) { el.style.display = 'none'; return; }
    const lang = localStorage.getItem('lang') || 'bg';
    const comment = (lang === 'bg' || !data.comment_en) ? data.comment_bg : data.comment_en;
    const label = (lang === 'bg') ? 'BUZZ КАЗВА' : 'BUZZ SAYS';
    el.innerHTML = `<span style="font-family:'IBM Plex Sans',sans-serif;font-size:9px;font-weight:700;letter-spacing:1.5px;color:#FF8C00;display:block;margin-bottom:3px;">${label}</span><span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14px;color:#FFD199;">${comment}</span>`;
    el.style.display = '';
  } catch { el.style.display = 'none'; }
})();
