const API_BASE = 'https://sofiabuzz.com';
let currentTab = 'saved';
let allEvents = [];
let savedIds = [];
let attendingIds = [];

const CATEGORY_COLORS = {
  'Rock': '#6B1A00', 'Electronic': '#3D1F80', 'Jazz': '#804000',
  'Festival': '#CC4400', 'Pop': '#801A3D', 'Reggae': '#1A5020',
};

function authHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('userToken')}`, 'Content-Type': 'application/json' };
}

function navigateToEvent(id) {
  const main = document.querySelector('main');
  if (main) main.classList.add('page-exit');
  setTimeout(() => { window.location.href = `event.html?id=${id}`; }, 250);
}

function eventRowHTML(ev) {
  const color = CATEGORY_COLORS[ev.category] || '#2A1200';
  const d = new Date(ev.start_time);
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const imgContent = ev.image_url
    ? `<img src="${ev.image_url}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" loading="lazy">`
    : '';
  return `
    <div onclick="navigateToEvent('${ev.id}')" style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;border:1px solid rgba(255,140,0,0.15);margin-bottom:8px;background:var(--surface);cursor:pointer;transition:all 0.2s ease;" onmouseover="this.style.borderColor='rgba(255,140,0,0.45)';this.style.transform='translateY(-1px)'" onmouseout="this.style.borderColor='rgba(255,140,0,0.15)';this.style.transform=''">
      <div style="width:44px;height:44px;border-radius:8px;background:${color};flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;">
        ${imgContent}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-family:'DM Serif Display',serif;font-style:italic;font-size:15px;color:var(--cream);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ev.title}</div>
        <div style="font-family:'IBM Plex Sans',sans-serif;font-size:11px;color:var(--muted-dark);margin-top:2px;">${ev.venue || ''} · ${date}</div>
      </div>
      <div style="font-family:'DM Serif Display',serif;font-style:italic;font-size:14px;color:var(--gold);flex-shrink:0;">${ev.price_text || ''}</div>
    </div>`;
}

function renderEmpty(tab) {
  const isSaved = tab === 'saved';
  document.getElementById('event-list').innerHTML = `
    <div style="text-align:center;padding:48px 24px 32px;">
      <span style="display:block;font-size:48px;margin-bottom:12px;">${isSaved ? '🔖' : '🎪'}</span>
      <div style="font-family:'DM Serif Display',serif;color:var(--gold);font-size:18px;margin-bottom:8px;">${isSaved ? 'Nothing saved yet' : 'Not attending anything yet'}</div>
      <p style="font-family:'Cormorant Garamond',serif;color:var(--muted-dark);font-size:15px;margin-bottom:20px;font-style:italic;">${isSaved ? 'Tap ♡ on any event to save it' : "Tap 'I'm going' on any event"}</p>
      <a href="events.html" style="display:inline-block;background:linear-gradient(135deg,#FF6B35,#FFD700);color:#1A0A00;font-family:'IBM Plex Sans',sans-serif;font-weight:700;font-size:13px;border-radius:999px;padding:10px 24px;text-decoration:none;">Browse events →</a>
    </div>`;
}

function renderTab(tab) {
  const ids = tab === 'saved' ? savedIds : attendingIds;
  const events = allEvents.filter(e => ids.includes(String(e.id)));
  if (!events.length) { renderEmpty(tab); return; }
  document.getElementById('event-list').innerHTML = events.map(eventRowHTML).join('');
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-saved-btn').classList.toggle('active', tab === 'saved');
  document.getElementById('tab-attending-btn').classList.toggle('active', tab === 'attending');
  const list = document.getElementById('event-list');
  list.style.opacity = '0';
  list.style.transition = 'opacity 0.2s ease';
  setTimeout(() => {
    renderTab(tab);
    list.style.opacity = '1';
  }, 200);
}

async function init() {
  const token = localStorage.getItem('userToken');
  if (!token) { window.location.href = 'auth.html'; return; }

  const tab = new URLSearchParams(window.location.search).get('tab') === 'attending' ? 'attending' : 'saved';
  currentTab = tab;
  document.getElementById('tab-saved-btn').classList.toggle('active', tab === 'saved');
  document.getElementById('tab-attending-btn').classList.toggle('active', tab === 'attending');

  try {
    const [eventsRes, savedRes, attendingRes] = await Promise.all([
      fetch(`${API_BASE}/api/events`),
      fetch(`${API_BASE}/api/users/saved/ids`, { headers: authHeaders() }),
      fetch(`${API_BASE}/api/users/attending/ids`, { headers: authHeaders() }),
    ]);

    allEvents = eventsRes.ok ? await eventsRes.json() : [];
    if (savedRes.ok) { const d = await savedRes.json(); savedIds = (d.savedIds || []).map(String); }
    if (attendingRes.ok) { const d = await attendingRes.json(); attendingIds = (d.attendingIds || []).map(String); }

    renderTab(tab);
  } catch (err) {
    console.error(err);
    document.getElementById('event-list').innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem 0;font-family:\'IBM Plex Sans\',sans-serif;">Could not load events.</p>';
  }
}

init();
