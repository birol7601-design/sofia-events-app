const API = 'https://sofiabuzz.com';
const params = new URLSearchParams(window.location.search);
const userId = params.get('id');

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function authHeaders() {
  const t = localStorage.getItem('userToken');
  return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : {};
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
  return m[(cat||'').toLowerCase()] || { emoji:'🎵', accent:'#FF8C00', badgeBg:'rgba(212,175,55,0.18)', badgeText:'#F4D06F' };
}

function eventCardHTML(ev) {
  const c = CATEGORY_MAP(ev.category);
  const date = formatDate(ev.start_time);
  const img = ev.image_url
    ? `<div class="event-img" style="background-image:url('${ev.image_url}')"></div>`
    : `<div class="event-img" style="background:${c.accent}20;"></div>`;
  return `
    <div class="event-card" onclick="window.location.href='event.html?id=${ev.id}'">
      <div class="card-image-wrap">${img}</div>
      <div class="card-body">
        <div class="card-badges"><span class="badge" style="background:${c.badgeBg};color:${c.badgeText};">${c.emoji} ${ev.category}</span></div>
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
      <div style="font-family:'DM Serif Display',serif;color:#FF8C00;font-size:16px;font-weight:700;margin-bottom:8px;">${isSaved ? 'No saved events yet' : 'Not attending any events yet'}</div>
    </div>`;
}

async function loadUserTab(tab) {
  const listId = `user-${tab}-list`;
  document.getElementById(listId).innerHTML = `<p style="text-align:center;color:#8B6040;font-family:'IBM Plex Sans',sans-serif;font-size:14px;padding:40px;">Loading…</p>`;
  try {
    const res = await fetch(`${API}/api/users/${userId}/${tab}`, { headers: authHeaders() });
    if (!res.ok) { renderEmpty(listId, tab); return; }
    const events = await res.json();
    if (events.length === 0) { renderEmpty(listId, tab); return; }
    document.getElementById(listId).innerHTML = events.map(eventCardHTML).join('');
  } catch { renderEmpty(listId, tab); }
}

function switchUserTab(tab) {
  document.getElementById('user-saved-list').style.display = tab === 'saved' ? '' : 'none';
  document.getElementById('user-attending-list').style.display = tab === 'attending' ? '' : 'none';
  document.getElementById('utab-saved-btn').classList.toggle('active', tab === 'saved');
  document.getElementById('utab-attending-btn').classList.toggle('active', tab === 'attending');
  loadUserTab(tab);
}

// ── FRIEND ACTIONS ─────────────────────────────────────────────────────────────

function btnStyle(primary) {
  if (primary) return 'background:linear-gradient(135deg,#F4D06F,#FF8C00,#B8860B);color:#1A0A00;border:none;border-radius:999px;font-size:12px;padding:7px 18px;cursor:pointer;font-family:\'IBM Plex Sans\',sans-serif;font-weight:700;';
  return 'background:transparent;border:1px solid rgba(212,175,55,0.5);color:#FF8C00;border-radius:999px;font-size:12px;padding:7px 18px;cursor:pointer;font-family:\'IBM Plex Sans\',sans-serif;';
}

function renderFriendActions(status, profileAvatarType, username) {
  const actionsEl = document.getElementById('friend-actions');
  if (!actionsEl) return;
  const msgUrl = `messages.html?user=${userId}&name=${encodeURIComponent(username)}&avatar=${profileAvatarType || 'star'}`;

  if (status === 'accepted') {
    actionsEl.innerHTML = `
      <button disabled style="${btnStyle(false)}opacity:0.5;cursor:default;">Friends ✓</button>
      <a href="${msgUrl}" style="${btnStyle(true)}text-decoration:none;display:inline-block;">Message</a>`;
  } else if (status === 'pending_sent') {
    actionsEl.innerHTML = `
      <button disabled style="${btnStyle(false)}opacity:0.5;cursor:default;">Request sent ✓</button>
      <a href="${msgUrl}" style="${btnStyle(false)}text-decoration:none;display:inline-block;">Message</a>`;
  } else if (status === 'pending_received') {
    actionsEl.innerHTML = `
      <button onclick="acceptFriend()" style="${btnStyle(true)}">Accept</button>
      <button onclick="declineFriend()" style="${btnStyle(false)}">Decline</button>
      <a href="${msgUrl}" style="${btnStyle(false)}text-decoration:none;display:inline-block;">Message</a>`;
  } else {
    actionsEl.innerHTML = `
      <button onclick="sendFriendRequest()" style="${btnStyle(true)}">Add friend</button>
      <a href="${msgUrl}" style="${btnStyle(false)}text-decoration:none;display:inline-block;">Message</a>`;
  }
}

async function sendFriendRequest() {
  try {
    const res = await fetch(`${API}/api/friends/request/${userId}`, { method: 'POST', headers: authHeaders() });
    if (res.ok || res.status === 400) {
      const actionsEl = document.getElementById('friend-actions');
      if (actionsEl) {
        const btn = actionsEl.querySelector('button');
        if (btn) { btn.textContent = 'Request sent ✓'; btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'default'; }
      }
    }
  } catch {}
}

async function acceptFriend() {
  try {
    const res = await fetch(`${API}/api/friends/accept/${userId}`, { method: 'POST', headers: authHeaders() });
    if (res.ok) {
      const username = document.getElementById('user-username').textContent;
      const avatarType = localStorage.getItem('_viewedUserAvatarType') || 'star';
      renderFriendActions('accepted', avatarType, username);
    }
  } catch {}
}

async function declineFriend() {
  try {
    const res = await fetch(`${API}/api/friends/decline/${userId}`, { method: 'POST', headers: authHeaders() });
    if (res.ok) {
      const username = document.getElementById('user-username').textContent;
      const avatarType = localStorage.getItem('_viewedUserAvatarType') || 'star';
      renderFriendActions('none', avatarType, username);
    }
  } catch {}
}

// ── UNREAD DOT ────────────────────────────────────────────────────────────────

async function checkUnreadMessages() {
  const token = localStorage.getItem('userToken');
  if (!token) return;
  try {
    const res = await fetch(`${API}/api/messages/unread-count`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) return;
    const { count } = await res.json();
    if (count > 0) {
      const navMsg = document.getElementById('nav-messages');
      if (navMsg && !navMsg.querySelector('.unread-dot')) {
        const dot = document.createElement('span');
        dot.className = 'unread-dot';
        dot.style.cssText = 'position:absolute;top:-2px;right:-2px;width:8px;height:8px;border-radius:50%;background:#FF8C00;';
        navMsg.style.position = 'relative';
        navMsg.appendChild(dot);
      }
    }
  } catch {}
}

// ── INIT ──────────────────────────────────────────────────────────────────────

async function init() {
  if (!userId) { window.location.href = 'index.html'; return; }

  const token = localStorage.getItem('userToken');
  const myId = localStorage.getItem('userId');

  try {
    const res = await fetch(`${API}/api/users/${userId}/profile`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });

    if (res.status === 403 || !res.ok) {
      document.getElementById('user-hero').style.display = 'none';
      document.getElementById('private-msg').style.display = 'block';
      return;
    }

    const user = await res.json();
    document.getElementById('user-username').textContent = user.username;
    document.getElementById('user-bio').textContent = user.bio || '';

    const avatarEl = document.getElementById('user-avatar');
    avatarEl.innerHTML = window.getAvatarSVG(user.avatar_type || 'star', 72);
    localStorage.setItem('_viewedUserAvatarType', user.avatar_type || 'star');

    const wm = document.getElementById('user-hero-watermark');
    if (wm) wm.textContent = user.username;
    document.title = `${user.username} — SofiaBuzz`;

    if (token && myId && String(myId) !== String(userId)) {
      try {
        const statusRes = await fetch(`${API}/api/friends/status/${userId}`, { headers: authHeaders() });
        if (statusRes.ok) {
          const { status } = await statusRes.json();
          renderFriendActions(status, user.avatar_type || 'star', user.username);
        }
      } catch {}
    }

    document.getElementById('user-tabs-wrap').style.display = '';
    switchUserTab('saved');
  } catch {
    document.getElementById('private-msg').style.display = 'block';
    document.getElementById('user-hero').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
  }

  checkUnreadMessages();
}

init();
