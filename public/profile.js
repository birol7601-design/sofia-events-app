const API = '';
let currentTab = 'saved';
let searchTimer = null;
let isPublic = true;
let currentAvatarType = localStorage.getItem('userAvatarType') || 'star';
let selectedAvatarType = currentAvatarType;

function authHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('userToken')}`, 'Content-Type': 'application/json' };
}

function logout() {
  ['userToken', 'userName', 'userAvatarColor', 'userId', 'userAvatarType'].forEach(k => localStorage.removeItem(k));
  window.location.href = 'auth.html';
}

function renderAvatar(avatarType) {
  const el = document.getElementById('profile-avatar');
  if (el) el.innerHTML = window.getAvatarSVG(avatarType || 'star', 72);
}

function setPrivacyDisplay(pub) {
  isPublic = pub;
  const el = document.getElementById('stat-privacy');
  if (el) el.textContent = pub ? '🌐 Public' : '🔒 Private';
}

async function togglePrivacy() {
  try {
    const res = await fetch(`${API}/api/users/me`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ is_public: !isPublic })
    });
    if (res.ok) { const d = await res.json(); setPrivacyDisplay(d.is_public); }
  } catch {}
}

function catAccent(cat) {
  const m = { Rock:'#6B2D5C', Pop:'#6B2D5C', Reggae:'#6B2D5C', Electronic:'#4A3D8F', Jazz:'#8C5A2B', Festival:'#B8860B' };
  return m[cat] || '#2A2736';
}

function catInfo(cat) {
  const m = {
    techno:{ emoji:'⚡', badgeBg:'rgba(123,94,167,0.18)', badgeText:'#C4A8E8' },
    house: { emoji:'🏠', badgeBg:'rgba(45,125,154,0.18)',  badgeText:'#7EC8E3' },
    jazz:  { emoji:'🎷', badgeBg:'rgba(181,112,10,0.18)',  badgeText:'#F4C56A' },
    rock:  { emoji:'🎸', badgeBg:'rgba(192,57,43,0.18)',   badgeText:'#F1948A' },
    classical:{ emoji:'🎻', badgeBg:'rgba(26,107,58,0.18)', badgeText:'#82E0AA' },
    pop:   { emoji:'🎤', badgeBg:'rgba(142,68,173,0.18)',  badgeText:'#D7BDE2' },
    rnb:   { emoji:'🎶', badgeBg:'rgba(108,52,131,0.18)',  badgeText:'#D2B4DE' },
    hiphop:{ emoji:'🎤', badgeBg:'rgba(120,66,18,0.18)',   badgeText:'#F0B27A' },
    drum_and_bass:{ emoji:'🥁', badgeBg:'rgba(26,82,118,0.18)', badgeText:'#85C1E9' },
  };
  return m[(cat||'').toLowerCase()] || { emoji:'🎵', badgeBg:'rgba(212,175,55,0.18)', badgeText:'#F4D06F' };
}

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

function eventCardHTML(ev) {
  const catColors = { 'Rock':'#6B2D5C', 'Pop':'#6B2D5C', 'Reggae':'#6B2D5C', 'Electronic':'#4A3D8F', 'Jazz':'#8C5A2B', 'Festival':'#B8860B', 'default':'#2A2736' };
  const squareColor = catColors[ev.category] || catColors['default'];
  const date = formatDate(ev.start_time);
  return `
    <div onclick="window.location.href='event.html?id=${ev.id}'" style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;border:1px solid rgba(212,175,55,0.15);margin-bottom:8px;background:#220D00;cursor:pointer;">
      <div style="width:36px;height:36px;border-radius:8px;background:${squareColor};flex-shrink:0;"></div>
      <div style="flex:1;min-width:0;">
        <div style="color:#FFD199;font-family:'IBM Plex Sans',sans-serif;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ev.title}</div>
        <div style="color:#8B6040;font-family:'IBM Plex Sans',sans-serif;font-size:12px;">${ev.venue}${date ? ' · ' + date : ''}</div>
      </div>
      <span style="color:#FF8C00;font-size:18px;flex-shrink:0;">›</span>
    </div>`;
}

function renderEmpty(containerId, tab) {
  const isSaved = tab === 'saved';
  document.getElementById(containerId).innerHTML = `
    <div style="text-align:center;padding:48px 24px 32px;">
      <span style="display:block;font-size:48px;margin-bottom:12px;">${isSaved ? '🎭' : '🎪'}</span>
      <div style="font-family:'DM Serif Display',serif;color:#FF8C00;font-size:16px;font-weight:700;margin-bottom:8px;">${isSaved ? 'No saved events yet' : 'Not attending any events yet'}</div>
      <p style="font-family:'IBM Plex Sans',sans-serif;color:#8B6040;font-size:13px;margin-bottom:20px;">${isSaved ? 'Tap ♡ on any event to save it' : "Tap 'I'm going' on any event to mark attendance"}</p>
      <a href="index.html" style="display:inline-block;background:linear-gradient(135deg,#F4D06F,#FF8C00,#B8860B);color:#1A0A00;font-family:'IBM Plex Sans',sans-serif;font-weight:700;font-size:13px;border-radius:999px;padding:10px 24px;text-decoration:none;">Browse events →</a>
    </div>`;
}

async function loadTab(tab) {
  const userId = localStorage.getItem('userId');
  const listId = `${tab}-list`;
  document.getElementById(listId).innerHTML = `<p style="text-align:center;color:#8B6040;font-family:'IBM Plex Sans',sans-serif;font-size:14px;padding:40px;">Loading…</p>`;
  try {
    const res = await fetch(`${API}/api/users/${userId}/${tab}`, { headers: authHeaders() });
    if (!res.ok) { renderEmpty(listId, tab); return; }
    const events = await res.json();
    const statEl = document.getElementById(tab === 'saved' ? 'stat-saved' : 'stat-attending');
    if (statEl) statEl.textContent = events.length;
    if (events.length === 0) { renderEmpty(listId, tab); return; }
    document.getElementById(listId).innerHTML = events.map(eventCardHTML).join('');
  } catch { renderEmpty(listId, tab); }
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-saved-btn').classList.toggle('active', tab === 'saved');
  document.getElementById('tab-attending-btn').classList.toggle('active', tab === 'attending');
  const savedList = document.getElementById('saved-list');
  const attendingList = document.getElementById('attending-list');
  savedList.style.display = tab === 'saved' ? '' : 'none';
  attendingList.style.display = tab === 'attending' ? '' : 'none';
  const activeList = tab === 'saved' ? savedList : attendingList;
  activeList.style.opacity = '0';
  activeList.style.transform = 'translateY(6px)';
  activeList.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  loadTab(tab);
  setTimeout(() => {
    activeList.style.opacity = '1';
    activeList.style.transform = 'translateY(0)';
  }, 200);
}

// ── AVATAR PICKER ─────────────────────────────────────────────────────────────

const AVATAR_KEYS = ['star','crown','moon','diamond','flame','compass','eye','vinyl'];

function buildAvatarPicker() {
  const grid = document.getElementById('avatar-picker');
  if (!grid) return;
  grid.innerHTML = AVATAR_KEYS.map(key => `
    <div id="apick-${key}" onclick="selectAvatar('${key}')" style="cursor:pointer;border-radius:50%;overflow:hidden;transition:box-shadow 0.15s;">
      ${window.getAvatarSVG(key, 56)}
    </div>`).join('');
  highlightSelectedAvatar();
}

function highlightSelectedAvatar() {
  AVATAR_KEYS.forEach(k => {
    const el = document.getElementById(`apick-${k}`);
    if (!el) return;
    el.style.boxShadow = k === selectedAvatarType ? '0 0 0 3px #FF8C00' : 'none';
    el.style.borderRadius = '50%';
  });
}

function selectAvatar(key) {
  selectedAvatarType = key;
  highlightSelectedAvatar();
}

function openEditModal() {
  document.getElementById('edit-modal').style.display = 'flex';
  const bio = document.getElementById('profile-bio-display').textContent;
  document.getElementById('edit-bio').value = bio === 'No bio yet.' ? '' : bio;
  document.getElementById('edit-error').textContent = '';
  selectedAvatarType = currentAvatarType;
  buildAvatarPicker();
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

async function saveProfile() {
  const bio = document.getElementById('edit-bio').value.trim();
  const errEl = document.getElementById('edit-error');
  errEl.textContent = '';
  try {
    const res = await fetch(`${API}/api/users/me`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ bio, is_public: isPublic, avatar_type: selectedAvatarType })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Failed to save.'; return; }
    document.getElementById('profile-bio-display').textContent = data.bio || 'No bio yet.';
    setPrivacyDisplay(data.is_public);
    currentAvatarType = selectedAvatarType;
    localStorage.setItem('userAvatarType', currentAvatarType);
    renderAvatar(currentAvatarType);
    closeEditModal();
  } catch { errEl.textContent = 'Network error.'; }
}

// ── INLINE AVATAR PICKER ─────────────────────────────────────────────────────

let inlineAvatarType = currentAvatarType;

function buildInlineAvatarPicker() {
  const grid = document.getElementById('avatar-picker-grid-inline');
  if (!grid) return;
  inlineAvatarType = currentAvatarType;
  grid.innerHTML = AVATAR_KEYS.map(key => `
    <div id="iapick-${key}" onclick="selectInlineAvatar('${key}')" style="cursor:pointer;border-radius:50%;overflow:hidden;transition:box-shadow 0.15s,opacity 0.15s;">
      ${window.getAvatarSVG(key, 60)}
    </div>`).join('');
  highlightInlineAvatar();
}

function highlightInlineAvatar() {
  AVATAR_KEYS.forEach(k => {
    const el = document.getElementById(`iapick-${k}`);
    if (!el) return;
    el.style.boxShadow = k === inlineAvatarType ? '0 0 0 3px #FF8C00' : 'none';
    el.style.opacity = k === inlineAvatarType ? '1' : '0.6';
    el.style.borderRadius = '50%';
  });
}

function selectInlineAvatar(key) {
  inlineAvatarType = key;
  highlightInlineAvatar();
}

function openAvatarPicker() {
  buildInlineAvatarPicker();
  const el = document.getElementById('avatar-picker-inline');
  el.style.display = '';
  el.style.maxHeight = '0';
  el.style.overflow = 'hidden';
  el.style.opacity = '0';
  el.style.transition = 'max-height 0.35s ease, opacity 0.3s ease';
  requestAnimationFrame(() => {
    el.style.maxHeight = '400px';
    el.style.opacity = '1';
  });
}

function closeAvatarPicker() {
  const el = document.getElementById('avatar-picker-inline');
  el.style.maxHeight = '0';
  el.style.opacity = '0';
  setTimeout(() => { el.style.display = 'none'; }, 350);
}

async function saveAvatarOnly() {
  try {
    const res = await fetch(`${API}/api/users/me`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ avatar_type: inlineAvatarType })
    });
    if (res.ok) {
      currentAvatarType = inlineAvatarType;
      selectedAvatarType = inlineAvatarType;
      localStorage.setItem('userAvatarType', currentAvatarType);
      renderAvatar(currentAvatarType);
      closeAvatarPicker();
      showToast('Avatar updated! ✨');
    }
  } catch {}
}

// ── PEOPLE SEARCH ─────────────────────────────────────────────────────────────

function getInitial(name) { return name ? name[0].toUpperCase() : '?'; }

async function sendFriendRequest(userId, btn) {
  try {
    const res = await fetch(`${API}/api/friends/request/${userId}`, { method: 'POST', headers: authHeaders() });
    if (res.ok || res.status === 400) {
      btn.textContent = 'Request sent ✓';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    }
  } catch {}
}

function handlePeopleSearch(val) {
  clearTimeout(searchTimer);
  const el = document.getElementById('search-results');
  if (val.length < 2) { el.innerHTML = ''; return; }
  searchTimer = setTimeout(async () => {
    try {
      const res = await fetch(`${API}/api/users/search?q=${encodeURIComponent(val)}`);
      const users = await res.json();
      if (!res.ok || users.length === 0) {
        el.innerHTML = `<p style="font-size:13px;color:#8B6040;font-family:'IBM Plex Sans',sans-serif;padding:8px 0;">No users found.</p>`;
        return;
      }
      el.innerHTML = users.map(u => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;border:1px solid rgba(212,175,55,0.2);margin-bottom:6px;background:#220D00;">
          <div onclick="window.location.href='user.html?id=${u.id}'" style="cursor:pointer;flex-shrink:0;">${window.getAvatarSVG(u.avatar_type || 'star', 36)}</div>
          <div onclick="window.location.href='user.html?id=${u.id}'" style="flex:1;min-width:0;cursor:pointer;">
            <div style="color:#FFD199;font-family:'IBM Plex Sans',sans-serif;font-size:14px;font-weight:600;">${u.username}</div>
            <div style="color:#8B6040;font-family:'IBM Plex Sans',sans-serif;font-size:12px;">${u.bio ? u.bio.substring(0,50) : ''}</div>
          </div>
          <button id="addfriend-${u.id}" onclick="sendFriendRequest('${u.id}', this)" style="background:transparent;border:1px solid rgba(212,175,55,0.5);color:#FF8C00;border-radius:999px;font-size:11px;padding:5px 12px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;white-space:nowrap;flex-shrink:0;">Add friend</button>
        </div>`).join('');
    } catch { el.innerHTML = ''; }
  }, 300);
}

// ── FRIEND REQUESTS ───────────────────────────────────────────────────────────

function showToast(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#FF8C00;color:#1A0A00;padding:10px 20px;border-radius:999px;font-weight:600;font-family:\'IBM Plex Sans\',sans-serif;font-size:13px;z-index:999;white-space:nowrap;pointer-events:none;';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

function checkFriendRequestRow(sectionEl) {
  if (!sectionEl.querySelector('[data-request-row]')) {
    sectionEl.style.display = 'none';
    const dot = document.querySelector('#nav-profile .request-dot');
    if (dot) dot.remove();
  }
}

async function acceptRequest(requesterId, rowEl, sectionEl) {
  try {
    const res = await fetch(`${API}/api/friends/accept/${requesterId}`, { method: 'POST', headers: authHeaders() });
    if (res.ok) {
      rowEl.remove();
      checkFriendRequestRow(sectionEl);
      showToast('You are now friends! 🎉');
    }
  } catch {}
}

async function declineRequest(requesterId, rowEl, sectionEl) {
  try {
    const res = await fetch(`${API}/api/friends/decline/${requesterId}`, { method: 'POST', headers: authHeaders() });
    if (res.ok) {
      rowEl.remove();
      checkFriendRequestRow(sectionEl);
    }
  } catch {}
}

async function loadFriendRequests() {
  const token = localStorage.getItem('userToken');
  if (!token) return;
  const sectionEl = document.getElementById('friend-requests-section');
  if (!sectionEl) return;
  try {
    const res = await fetch(`${API}/api/friends/pending`, { headers: authHeaders() });
    if (!res.ok) return;
    const requests = await res.json();
    if (!requests.length) return;

    sectionEl.style.display = '';
    sectionEl.innerHTML = `<p style="font-family:'IBM Plex Sans',sans-serif;font-size:10px;color:#FF8C00;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin:0 0 6px;">Friend Requests</p><div id="request-rows"></div>`;
    const rowsEl = sectionEl.querySelector('#request-rows');

    requests.forEach(u => {
      const row = document.createElement('div');
      row.setAttribute('data-request-row', u.id);
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #2A2736;';
      row.innerHTML = `
        <div style="flex-shrink:0;">${window.getAvatarSVG(u.avatarType || 'star', 36)}</div>
        <div style="flex:1;color:#FFD199;font-family:'IBM Plex Sans',sans-serif;font-size:13px;font-weight:500;">${u.username}</div>
        <button style="background:linear-gradient(135deg,#F4D06F,#FF8C00);color:#1A0A00;border:none;border-radius:999px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;">Accept ✓</button>
        <button style="background:transparent;border:1px solid #E8456B;color:#E8456B;border-radius:999px;padding:5px 12px;font-size:12px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;">Decline</button>`;
      const [acceptBtn, declineBtn] = row.querySelectorAll('button');
      acceptBtn.addEventListener('click', () => acceptRequest(u.id, row, sectionEl));
      declineBtn.addEventListener('click', () => declineRequest(u.id, row, sectionEl));
      rowsEl.appendChild(row);
    });

    const navProfile = document.getElementById('nav-profile');
    if (navProfile && !navProfile.querySelector('.request-dot')) {
      const dot = document.createElement('span');
      dot.className = 'request-dot';
      dot.style.cssText = 'position:absolute;top:-2px;right:-2px;width:8px;height:8px;border-radius:50%;background:#FF8C00;';
      navProfile.style.position = 'relative';
      navProfile.appendChild(dot);
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
  const token = localStorage.getItem('userToken');
  if (!token) { window.location.href = 'auth.html'; return; }

  const name = localStorage.getItem('userName') || '';
  document.getElementById('profile-username').textContent = name;
  renderAvatar(currentAvatarType);

  try {
    const res = await fetch(`${API}/api/users/me`, { headers: authHeaders() });
    if (res.status === 401) { logout(); return; }
    const data = await res.json();
    document.getElementById('profile-bio-display').textContent = data.bio || 'No bio yet.';
    setPrivacyDisplay(data.is_public !== false);
    if (data.avatar_type) {
      currentAvatarType = data.avatar_type;
      selectedAvatarType = data.avatar_type;
      localStorage.setItem('userAvatarType', data.avatar_type);
      renderAvatar(data.avatar_type);
    }
  } catch {}

  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab') === 'attending' ? 'attending' : 'saved';
  switchTab(tab);

  const otherId = tab === 'saved' ? 'attending' : 'saved';
  const userId = localStorage.getItem('userId');
  fetch(`${API}/api/users/${userId}/${otherId}`, { headers: authHeaders() })
    .then(r => r.json())
    .then(events => {
      const el = document.getElementById(otherId === 'saved' ? 'stat-saved' : 'stat-attending');
      if (el && Array.isArray(events)) el.textContent = events.length;
    }).catch(() => {});

  checkUnreadMessages();
  loadFriendRequests();
}

init();
