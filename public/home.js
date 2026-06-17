const API_BASE = '';

const CATEGORY_MAP = {
  'Rock':       { emoji: '🎸', accent: '#6B1A00' },
  'Electronic': { emoji: '🎧', accent: '#3D1F80' },
  'Jazz':       { emoji: '🎷', accent: '#804000' },
  'Festival':   { emoji: '🎪', accent: '#CC4400' },
  'Pop':        { emoji: '🎤', accent: '#801A3D' },
  'Reggae':     { emoji: '🌴', accent: '#1A5020' },
  'default':    { emoji: '🎫', accent: '#2A1200' },
};

function getCatInfo(cat) {
  return CATEGORY_MAP[cat] || CATEGORY_MAP['default'];
}

function homeNavigate(url) {
  const main = document.querySelector('main');
  if (main) main.classList.add('page-exit');
  setTimeout(() => { window.location.href = url; }, 250);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 'Good morning';
  if (h >= 12 && h < 18) return 'Good afternoon';
  if (h >= 18 && h < 22) return 'Good evening';
  return 'Good night';
}

function renderHighlights(events) {
  const strip = document.getElementById('highlights-strip');
  const upcoming = events
    .filter(e => new Date(e.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 5);

  if (!upcoming.length) {
    strip.innerHTML = '<p style="font-family:\'Cormorant Garamond\',serif;font-size:14px;color:var(--muted-dark);font-style:italic;">No upcoming events right now.</p>';
    return;
  }

  strip.innerHTML = upcoming.map(e => {
    const info = getCatInfo(e.category);
    const d = new Date(e.start_time);
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `
      <div class="highlight-card" onclick="homeNavigate('event.html?id=${e.id}')">
        <div class="highlight-card-top" style="background:${info.accent};">${info.emoji}</div>
        <div class="highlight-card-body">
          <div class="highlight-card-title">${e.title}</div>
          <div class="highlight-card-venue">${e.venue} · ${dateStr}</div>
          <div class="highlight-card-price">${e.price_text || ''}</div>
        </div>
      </div>`;
  }).join('');
}

function renderGenreBrowse(events, userGenres) {
  const container = document.getElementById('genre-browse');
  const genres = [...new Set(events.map(e => e.category))].filter(Boolean).sort();
  if (!genres.length) { container.parentElement.style.display = 'none'; return; }

  container.innerHTML = genres.map(g => {
    const info = getCatInfo(g);
    const sel = userGenres.includes(g);
    return `<button class="home-genre-pill${sel ? ' selected' : ''}" onclick="homeNavigate('index.html?genre=${encodeURIComponent(g)}')">${info.emoji} ${g}</button>`;
  }).join('');
}

async function init() {
  const token = localStorage.getItem('userToken');
  if (!token) { window.location.href = 'auth.html'; return; }

  const name = localStorage.getItem('userName') || 'there';
  document.getElementById('greeting-time').textContent = `${getGreeting()}, ${name}`;

  try {
    const headers = { 'Authorization': `Bearer ${token}` };
    const [eventsRes, prefsRes, savedRes, unreadRes] = await Promise.all([
      fetch(`${API_BASE}/api/events`),
      fetch(`${API_BASE}/api/users/preferences`, { headers }),
      fetch(`${API_BASE}/api/users/saved/ids`, { headers }),
      fetch(`${API_BASE}/api/messages/unread-count`, { headers }),
    ]);

    const events    = eventsRes.ok  ? await eventsRes.json()  : [];
    const prefs     = prefsRes.ok   ? await prefsRes.json()   : {};
    const savedData = savedRes.ok   ? await savedRes.json()   : { savedIds: [] };
    const unread    = unreadRes.ok  ? await unreadRes.json()  : { count: 0 };

    renderHighlights(events);
    renderGenreBrowse(events, prefs.genres || []);

    const savedCount = (savedData.savedIds || []).length;
    if (savedCount > 0) {
      const b = document.getElementById('badge-saved');
      if (b) { b.textContent = savedCount; b.style.display = 'flex'; }
    }

    const unreadCount = unread.count || 0;
    if (unreadCount > 0) {
      const b = document.getElementById('badge-messages');
      if (b) { b.textContent = unreadCount; b.style.display = 'flex'; }
    }
  } catch (err) {
    console.error(err);
    document.getElementById('highlights-strip').innerHTML =
      '<p style="color:var(--muted-dark);font-family:\'IBM Plex Sans\',sans-serif;font-size:13px;padding:8px 0;">Could not load events.</p>';
  }
}

init();
