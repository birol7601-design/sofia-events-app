const API = '';
let currentTab = 'saved';
let searchTimer = null;

function authHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('userToken')}`, 'Content-Type': 'application/json' };
}

function logout() {
  ['userToken', 'userName', 'userAvatarColor', 'userId'].forEach(k => localStorage.removeItem(k));
  window.location.href = 'auth.html';
}

function getInitial(name) {
  return name ? name[0].toUpperCase() : '?';
}

function renderAvatar(color) {
  const el = document.getElementById('profile-avatar');
  const name = localStorage.getItem('userName') || '';
  el.style.background = color || '#D4AF37';
  el.style.color = '#0A0912';
  el.textContent = getInitial(name);
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
      <div class="card-image-wrap">
        ${img}
      </div>
      <div class="card-body">
        <div class="card-badges">
          <span class="badge" style="background:${c.badgeBg};color:${c.badgeText};">${c.emoji} ${ev.category}</span>
        </div>
        <h3 class="card-title">${ev.title}</h3>
        <div class="card-meta">
          <span>${ev.venue}</span>
          <span>${date}</span>
        </div>
        <div class="card-price">${ev.price_text || 'Free'}</div>
      </div>
    </div>`;
}

function renderEmpty(containerId, msg) {
  document.getElementById(containerId).innerHTML =
    `<p style="text-align:center;color:#6E6A5F;font-family:'IBM Plex Sans',sans-serif;font-size:14px;padding:40px 20px;">${msg}</p>`;
}

async function loadTab(tab) {
  const userId = localStorage.getItem('userId');
  const listId = `${tab}-list`;
  document.getElementById(listId).innerHTML = `<p style="text-align:center;color:#6E6A5F;font-family:'IBM Plex Sans',sans-serif;font-size:14px;padding:40px;">Loading…</p>`;
  try {
    const res = await fetch(`${API}/api/users/${userId}/${tab}`, { headers: authHeaders() });
    if (!res.ok) { renderEmpty(listId, 'Could not load events.'); return; }
    const events = await res.json();
    if (events.length === 0) {
      renderEmpty(listId, tab === 'saved' ? 'No saved events yet. Heart an event to save it.' : 'No events marked as attending yet.');
      return;
    }
    document.getElementById(listId).innerHTML = events.map(eventCardHTML).join('');
  } catch {
    renderEmpty(listId, 'Network error.');
  }
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('saved-list').style.display = tab === 'saved' ? '' : 'none';
  document.getElementById('attending-list').style.display = tab === 'attending' ? '' : 'none';
  document.getElementById('tab-saved-btn').classList.toggle('active', tab === 'saved');
  document.getElementById('tab-attending-btn').classList.toggle('active', tab === 'attending');
  loadTab(tab);
}

function openEditModal() {
  const modal = document.getElementById('edit-modal');
  modal.style.display = 'flex';
  const bio = document.getElementById('profile-bio-display').textContent;
  document.getElementById('edit-bio').value = bio === 'No bio yet.' ? '' : bio;
  document.getElementById('edit-error').textContent = '';
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

async function saveProfile() {
  const bio = document.getElementById('edit-bio').value.trim();
  const is_public = document.getElementById('edit-public').checked;
  const errEl = document.getElementById('edit-error');
  errEl.textContent = '';
  try {
    const res = await fetch(`${API}/api/users/me`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ bio, is_public })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Failed to save.'; return; }
    document.getElementById('profile-bio-display').textContent = data.bio || 'No bio yet.';
    document.getElementById('edit-public').checked = data.is_public;
    closeEditModal();
  } catch {
    errEl.textContent = 'Network error.';
  }
}

function handlePeopleSearch(val) {
  clearTimeout(searchTimer);
  const el = document.getElementById('search-results');
  if (val.length < 2) { el.innerHTML = ''; return; }
  searchTimer = setTimeout(async () => {
    try {
      const res = await fetch(`${API}/api/users/search?q=${encodeURIComponent(val)}`);
      const users = await res.json();
      if (!res.ok || users.length === 0) { el.innerHTML = `<p style="font-size:13px;color:#6E6A5F;font-family:'IBM Plex Sans',sans-serif;padding:8px 0;">No users found.</p>`; return; }
      el.innerHTML = users.map(u => `
        <div onclick="window.location.href='user.html?id=${u.id}'" style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;cursor:pointer;border:1px solid rgba(212,175,55,0.2);margin-bottom:6px;background:#16151F;">
          <div style="width:36px;height:36px;border-radius:50%;background:${u.avatar_color||'#D4AF37'};display:flex;align-items:center;justify-content:center;font-weight:700;color:#0A0912;font-family:'IBM Plex Sans',sans-serif;flex-shrink:0;">${getInitial(u.username)}</div>
          <div>
            <div style="color:#F0E8D6;font-family:'IBM Plex Sans',sans-serif;font-size:14px;font-weight:600;">${u.username}</div>
            <div style="color:#6E6A5F;font-family:'IBM Plex Sans',sans-serif;font-size:12px;">${u.bio ? u.bio.substring(0,50) : ''}</div>
          </div>
        </div>`).join('');
    } catch {
      el.innerHTML = '';
    }
  }, 300);
}

async function init() {
  const token = localStorage.getItem('userToken');
  if (!token) { window.location.href = 'auth.html'; return; }

  const name = localStorage.getItem('userName') || '';
  const color = localStorage.getItem('userAvatarColor') || '#D4AF37';

  document.getElementById('profile-username').textContent = name;
  renderAvatar(color);

  try {
    const res = await fetch(`${API}/api/users/me`, { headers: authHeaders() });
    if (res.status === 401) { logout(); return; }
    const data = await res.json();
    document.getElementById('profile-bio-display').textContent = data.bio || 'No bio yet.';
    document.getElementById('edit-public').checked = data.is_public !== false;
  } catch {}

  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab') === 'attending' ? 'attending' : 'saved';
  switchTab(tab);
}

init();
