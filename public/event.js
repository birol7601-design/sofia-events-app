const API_BASE = '';

const CATEGORY_MAP = {
  'Rock':        { emoji: '🎸', accent: '#6B1A00', badgeBg: '#4A1000', badgeText: '#FFB07A' },
  'Electronic':  { emoji: '🎧', accent: '#3D1F80', badgeBg: '#281060', badgeText: '#C8B0FF' },
  'Jazz':        { emoji: '🎷', accent: '#804000', badgeBg: '#4A2800', badgeText: '#FFE080' },
  'Festival':    { emoji: '🎪', accent: '#CC4400', badgeBg: '#803000', badgeText: '#FFCC80' },
  'Pop':         { emoji: '🎤', accent: '#801A3D', badgeBg: '#4A0F22', badgeText: '#FFB0C0' },
  'Reggae':      { emoji: '🌴', accent: '#1A5020', badgeBg: '#0D3014', badgeText: '#80FF90' },
  'default':     { emoji: '🎫', accent: '#2A1200', badgeBg: '#1A0A00', badgeText: '#C7A880' },
};

function getCatInfo(category) {
  return CATEGORY_MAP[category] || CATEGORY_MAP['default'];
}

function getTimeOfDay(hour) {
  if (hour >= 6 && hour < 12) return {
    label: 'Morning',
    gradient: 'linear-gradient(135deg, #3D1200 0%, #1A0A00 60%, #0A0500 100%)',
  };
  if (hour >= 12 && hour < 18) return {
    label: 'Afternoon',
    gradient: 'linear-gradient(135deg, #2A1000 0%, #1A0A00 60%, #0A0500 100%)',
  };
  if (hour >= 18 && hour < 22) return {
    label: 'Evening',
    gradient: 'linear-gradient(135deg, #6B1A00 0%, #3A0800 60%, #1A0500 100%)',
  };
  return {
    label: 'Night',
    gradient: 'linear-gradient(135deg, #1A0A00 0%, #0D0500 60%, #0A0300 100%)',
  };
}

async function loadEvent() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { showError('No event specified.'); return; }
  try {
    const res = await fetch(`${API_BASE}/api/events/${id}`);
    if (res.status === 404) { showError('Event not found.'); return; }
    if (!res.ok) { showError('Failed to load event.'); return; }
    const event = await res.json();

    let artistData = null;
    if (event.artist_id) {
      try {
        const aRes = await fetch(`${API_BASE}/api/artists/${event.artist_id}`);
        if (aRes.ok) artistData = await aRes.json();
      } catch {}
    }

    populatePage(event, id, artistData);
    loadMoreShows(event, id);
    wireHeartBtn(id);
    wireGoingBtn(id);
    initNav();
  } catch (err) {
    showError('Failed to load event.');
    console.error(err);
  }
}

function populatePage(event, rawId, artistData) {
  const info = getCatInfo(event.category);
  const date = new Date(event.start_time);
  const tod = getTimeOfDay(date.getHours());

  document.title = `${event.title} — SofiaBuzz`;

  const hero = document.getElementById('detail-hero');
  hero.style.background = tod.gradient;
  if (event.image_url) {
    const imgLayer = document.getElementById('hero-image-layer');
    imgLayer.style.backgroundImage = `url(${event.image_url})`;
  }
  const overlay = document.getElementById('hero-overlay');
  if (overlay) overlay.style.background = `linear-gradient(to bottom, transparent 20%, #1A0A00 100%)`;

  const badgesEl = document.getElementById('hero-badges');
  const pills = [];
  if (event.is_featured) {
    pills.push(`<span style="background:#1A0A00;color:#FF8C00;border:1px solid #FF8C00;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:1px;padding:4px 10px;font-family:'IBM Plex Sans',sans-serif;">★ FEATURED</span>`);
  }
  pills.push(`<span style="background:${info.badgeBg};color:${info.badgeText};border-radius:999px;font-size:10px;font-weight:500;padding:4px 10px;font-family:'IBM Plex Sans',sans-serif;">${info.emoji} ${event.category}</span>`);
  pills.push(`<span style="background:rgba(0,0,0,0.45);color:#C7A880;border-radius:999px;font-size:10px;padding:4px 10px;font-family:'IBM Plex Sans',sans-serif;">${tod.label}</span>`);
  badgesEl.innerHTML = pills.join('');

  document.getElementById('event-title').textContent = event.title;
  const subtitleEl = document.getElementById('event-subtitle');
  if (event.tour_name) {
    subtitleEl.textContent = event.tour_name;
    subtitleEl.style.color = '#FF8C00';
  } else {
    subtitleEl.style.display = 'none';
  }

  document.getElementById('info-venue').textContent = event.venue;
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('info-datetime').textContent = `${dateStr}, ${timeStr}`;

  document.getElementById('event-description').textContent = event.description || 'No description available.';

  // Artist section
  const artistName = artistData?.name ||
    (event.title.includes(' - ') ? event.title.split(' - ')[0].trim() : event.title);

  const nameEl = document.getElementById('artist-name');
  if (event.artist_id) {
    nameEl.innerHTML = `<a href="artist.html?id=${event.artist_id}" style="color:var(--cream);text-decoration:none;border-bottom:1px solid rgba(255,140,0,0.4);">${artistName} ›</a>`;
  } else {
    nameEl.textContent = artistName;
  }

  const initialEl = document.getElementById('artist-initial');
  if (initialEl) initialEl.textContent = artistName.charAt(0).toUpperCase();

  const avatarEl = document.getElementById('artist-avatar');
  if (avatarEl) avatarEl.style.background = `linear-gradient(135deg,${info.accent},#1A0A00)`;

  const metaParts = [event.genre, event.origin].filter(Boolean);
  const metaEl = document.getElementById('artist-meta');
  if (metaEl) metaEl.textContent = metaParts.join(' · ');

  const bioEl = document.getElementById('artist-bio');
  const bioText = artistData?.bio || event.artist_bio;
  if (bioText) {
    bioEl.textContent = bioText;
  } else {
    bioEl.innerHTML = '<em style="color:var(--muted-dark);">Biography coming soon.</em>';
  }

  document.getElementById('venue-name').textContent = event.venue;
  document.getElementById('venue-address').textContent = `${event.venue}, Sofia`;
  document.getElementById('maps-link').href =
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(event.venue + ', Sofia, Bulgaria');
  document.getElementById('maps-link').style.cssText = 'display:inline-block;background:rgba(204,68,0,0.15);color:#FF8C00;border:1px solid rgba(255,140,0,0.5);border-radius:999px;font-size:11px;padding:7px 16px;text-decoration:none;font-family:\'IBM Plex Sans\',sans-serif;';

  document.getElementById('share-btn').style.cssText = 'width:100%;background:var(--surface);border:1px solid var(--border);color:var(--muted);border-radius:999px;padding:12px;font-size:13px;cursor:pointer;font-family:\'IBM Plex Sans\',sans-serif;';
  document.getElementById('share-btn').addEventListener('click', function () {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.textContent = 'Link copied!';
      setTimeout(() => { this.textContent = '🔗 Copy event link'; }, 1500);
    }).catch(() => {});
  });

  document.getElementById('bottom-price-value').textContent = event.price_text || '';
  const actionEl = document.getElementById('bottom-action');
  if (event.ticket_url) {
    actionEl.innerHTML = `<a href="${event.ticket_url}" target="_blank" rel="noopener" class="tickets-btn">Get tickets ↗</a>`;
  } else {
    actionEl.innerHTML = `<span class="no-tickets">More info coming soon</span>`;
  }
}

async function loadMoreShows(currentEvent, rawId) {
  const container = document.getElementById('more-shows');
  try {
    const res = await fetch(`${API_BASE}/api/events`);
    if (!res.ok) throw new Error('failed');
    const events = await res.json();
    const others = events
      .filter(e => e.category === currentEvent.category && String(e.id) !== String(rawId))
      .slice(0, 3);

    if (others.length === 0) {
      container.innerHTML = '<p style="font-family:\'Cormorant Garamond\',serif;font-size:15px;color:var(--muted-dark);font-style:italic;">No other shows in this category right now.</p>';
      return;
    }

    container.innerHTML = others.map(e => {
      const info = getCatInfo(e.category);
      const d = new Date(e.start_time);
      const ds = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `<a href="event.html?id=${e.id}" style="display:flex;align-items:center;gap:12px;text-decoration:none;padding:10px 0;border-bottom:1px solid var(--border);">
        <div style="width:38px;height:38px;border-radius:8px;background:${info.accent};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;">${info.emoji}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:'DM Serif Display',serif;font-style:italic;font-size:14px;color:var(--cream);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.title}</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:13px;color:var(--muted-dark);margin-top:2px;">${e.venue} · ${ds}</div>
        </div>
        <div style="font-family:'DM Serif Display',serif;font-style:italic;font-size:14px;color:var(--gold);flex-shrink:0;">${e.price_text || ''}</div>
      </a>`;
    }).join('');
  } catch (_) {
    container.innerHTML = '<p style="font-family:\'Cormorant Garamond\',serif;font-size:15px;color:var(--muted-dark);font-style:italic;">No other shows right now.</p>';
  }
}

function initNav() {
  const token = localStorage.getItem('userToken');
  const navProfile = document.getElementById('nav-profile');
  const navSaved = document.getElementById('nav-saved');
  if (!navProfile) return;
  if (!token) {
    navProfile.href = 'auth.html';
    if (navSaved) navSaved.href = 'auth.html';
  } else {
    const initial = (localStorage.getItem('userName') || '?')[0].toUpperCase();
    const color = localStorage.getItem('userAvatarColor') || '#FF8C00';
    navProfile.innerHTML = `<span class="nav-icon" style="width:22px;height:22px;border-radius:50%;background:${color};color:#1A0A00;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${initial}</span><span class="nav-label">Profile</span>`;
  }
}

async function wireHeartBtn(eventId) {
  const btn = document.getElementById('hero-heart-btn');
  if (!btn) return;
  const token = localStorage.getItem('userToken');

  function setHeartState(saved) {
    const path = btn.querySelector('path');
    path.setAttribute('fill', saved ? '#FF8C00' : 'none');
    path.setAttribute('stroke', saved ? '#FF8C00' : 'white');
  }

  if (token) {
    try {
      const res = await fetch(`${API_BASE}/api/users/saved/ids`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHeartState(data.savedIds.map(String).includes(String(eventId)));
      }
    } catch {}
  }

  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!token) { window.location.href = 'auth.html'; return; }
    try {
      const res = await fetch(`${API_BASE}/api/users/saved/${eventId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setHeartState(data.saved);
      }
    } catch {}
  });
}

async function wireGoingBtn(eventId) {
  const goingBtn = document.getElementById('going-btn');
  const strip = document.getElementById('attending-strip');
  const countText = document.getElementById('attending-count-text');
  if (!goingBtn || !strip) return;

  const token = localStorage.getItem('userToken');

  async function loadCount() {
    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/attending-count`);
      if (res.ok) {
        const data = await res.json();
        const n = data.count;
        countText.textContent = n > 0 ? `${n} ${n === 1 ? 'person' : 'people'} attending` : '';
        strip.style.display = '';
      }
    } catch {}
  }

  async function loadAttending() {
    if (!token) { strip.style.display = ''; return; }
    try {
      const res = await fetch(`${API_BASE}/api/users/attending/ids`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const isAttending = data.attendingIds.map(String).includes(String(eventId));
        goingBtn.classList.toggle('attending', isAttending);
        goingBtn.textContent = isAttending ? "I'm going ✓" : "I'm going";
      }
    } catch {}
  }

  await Promise.all([loadCount(), loadAttending()]);

  goingBtn.addEventListener('click', async () => {
    if (!token) { window.location.href = 'auth.html'; return; }
    try {
      const res = await fetch(`${API_BASE}/api/users/attending/${eventId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        goingBtn.classList.toggle('attending', data.attending);
        goingBtn.textContent = data.attending ? "I'm going ✓" : "I'm going";
        loadCount();
      }
    } catch {}
  });
}

function showError(msg) {
  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;padding:2rem;background:#1A0A00;">
      <div style="font-size:48px;">🎫</div>
      <p style="color:var(--muted);text-align:center;font-family:'IBM Plex Sans',sans-serif;">${msg}</p>
      <a href="index.html" style="color:#FF8C00;font-weight:600;text-decoration:none;font-family:'IBM Plex Sans',sans-serif;">← Back to events</a>
    </div>
  `;
}

loadEvent();
