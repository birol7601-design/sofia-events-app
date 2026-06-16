const API = '';
const params = new URLSearchParams(window.location.search);
const userId = params.get('id');

function getInitial(name) { return name ? name[0].toUpperCase() : '?'; }

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CATEGORY_MAP(cat) {
  const m = {
    techno: { emoji:'⚡', accent:'#7B5EA7', badgeBg:'rgba(123,94,167,0.18)', badgeText:'#C4A8E8' },
    house:  { emoji:'🏠', accent:'#2D7D9A', badgeBg:'rgba(45,125,154,0.18)', badgeText:'#7EC8E3' },
    jazz:   { emoji:'🎷', accent:'#B5700A', badgeBg:'rgba(181,112,10,0.18)',  badgeText:'#F4C56A' },
    rock:   { emoji:'🎸', accent:'#C0392B', badgeBg:'rgba(192,57,43,0.18)',   badgeText:'#F1948A' },
    classical:{ emoji:'🎻', accent:'#1A6B3A', badgeBg:'rgba(26,107,58,0.18)',  badgeText:'#82E0AA' },
    pop:    { emoji:'🎤', accent:'#8E44AD', badgeBg:'rgba(142,68,173,0.18)',  badgeText:'#D7BDE2' },
    rnb:    { emoji:'🎶', accent:'#6C3483', badgeBg:'rgba(108,52,131,0.18)',  badgeText:'#D2B4DE' },
    hiphop: { emoji:'🎤', accent:'#784212', badgeBg:'rgba(120,66,18,0.18)',   badgeText:'#F0B27A' },
    drum_and_bass: { emoji:'🥁', accent:'#1A5276', badgeBg:'rgba(26,82,118,0.18)', badgeText:'#85C1E9' },
  };
  return m[cat] || { emoji:'🎵', accent:'#D4AF37', badgeBg:'rgba(212,175,55,0.18)', badgeText:'#F4D06F' };
}

function eventCardHTML(ev) {
  const c = CATEGORY_MAP(ev.category);
  const date = formatDate(ev.start_time);
  const img = ev.image_url
    ? `<div class="event-img" style="background-image:url('${ev.image_url}')"></div>`
    : `<div class="event-img" style="background:linear-gradient(135deg,${c.accent}22,${c.accent}44);display:flex;align-items:center;justify-content:center;font-size:2rem;">${c.emoji}</div>`;
  return `
    <div class="event-card" onclick="window.location.href='event.html?id=${ev.id}'">
      <div class="card-image-wrap">${img}</div>
      <div class="card-body">
        <div class="card-badges">
          <span class="badge" style="background:${c.badgeBg};color:${c.badgeText};">${c.emoji} ${ev.category}</span>
        </div>
        <h3 class="card-title">${ev.title}</h3>
        <div class="card-meta"><span>${ev.venue}</span><span>${date}</span></div>
        <div class="card-price">${ev.price_text || 'Free'}</div>
      </div>
    </div>`;
}

function renderEmpty(id, tab) {
  const isSaved = tab === 'saved';
  document.getElementById(id).innerHTML = `
    <div style="text-align:center;padding:48px 24px 32px;">
      <span style="display:block;font-size:48px;margin-bottom:12px;">${isSaved ? '🎭' : '🎪'}</span>
      <div style="font-family:'Playfair Display',serif;color:#D4AF37;font-size:16px;font-weight:700;margin-bottom:8px;">
        ${isSaved ? 'No saved events yet' : 'Not attending any events yet'}
      </div>
      <p style="font-family:'IBM Plex Sans',sans-serif;color:#6E6A5F;font-size:13px;margin-bottom:20px;">
        ${isSaved ? 'Tap ♡ on any event to save it' : "Tap 'I'm going' on any event to mark attendance"}
      </p>
      <a href="index.html" style="display:inline-block;background:linear-gradient(135deg,#F4D06F,#D4AF37,#B8860B);color:#0A0912;font-family:'IBM Plex Sans',sans-serif;font-weight:700;font-size:13px;border-radius:999px;padding:10px 24px;text-decoration:none;">Browse events →</a>
    </div>`;
}

async function loadUserTab(tab) {
  const listId = `user-${tab}-list`;
  document.getElementById(listId).innerHTML = `<p style="text-align:center;color:#6E6A5F;font-family:'IBM Plex Sans',sans-serif;font-size:14px;padding:40px;">Loading…</p>`;
  const token = localStorage.getItem('userToken');
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  try {
    const res = await fetch(`${API}/api/users/${userId}/${tab}`, { headers });
    if (!res.ok) { renderEmpty(listId, tab); return; }
    const events = await res.json();
    if (events.length === 0) { renderEmpty(listId, tab); return; }
    document.getElementById(listId).innerHTML = events.map(eventCardHTML).join('');
  } catch {
    renderEmpty(listId, tab);
  }
}

function switchUserTab(tab) {
  document.getElementById('user-saved-list').style.display = tab === 'saved' ? '' : 'none';
  document.getElementById('user-attending-list').style.display = tab === 'attending' ? '' : 'none';
  document.getElementById('utab-saved-btn').classList.toggle('active', tab === 'saved');
  document.getElementById('utab-attending-btn').classList.toggle('active', tab === 'attending');
  loadUserTab(tab);
}

async function init() {
  if (!userId) { window.location.href = 'index.html'; return; }

  const navProfile = document.getElementById('nav-profile');
  const token = localStorage.getItem('userToken');
  if (!token) {
    navProfile.href = 'auth.html';
  }

  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch(`${API}/api/users/${userId}/profile`, { headers });

    if (res.status === 403) {
      document.getElementById('user-hero').style.display = 'none';
      document.getElementById('private-msg').style.display = 'block';
      return;
    }
    if (!res.ok) {
      document.getElementById('user-hero').style.display = 'none';
      document.getElementById('private-msg').style.display = 'block';
      return;
    }

    const user = await res.json();
    document.getElementById('user-username').textContent = user.username;
    document.getElementById('user-bio').textContent = user.bio || '';

    const avatarEl = document.getElementById('user-avatar');
    const c = user.avatar_color || '#D4AF37';
    avatarEl.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent), ${c}`;
    avatarEl.textContent = getInitial(user.username);

    const wm = document.getElementById('user-hero-watermark');
    if (wm) wm.textContent = user.username;

    document.title = `${user.username} — SofiaBuzz`;

    document.getElementById('user-tabs-wrap').style.display = '';
    switchUserTab('saved');
  } catch {
    document.getElementById('private-msg').style.display = 'block';
    document.getElementById('user-hero').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
  }
}

init();
