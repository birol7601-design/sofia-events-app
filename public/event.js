const API_BASE = 'https://sofiabuzz.com';

const CATEGORY_MAP = {
  'Rock':        { emoji: '🎸', border: 'var(--coral-border)', text: 'var(--coral-text)', accent: '#6B2D5C',  badgeBg: '#6B2D5C', badgeText: '#F5D5E8' },
  'Electronic':  { emoji: '🎧', border: 'var(--purple-border)', text: 'var(--purple-text)', accent: '#4A3D8F', badgeBg: '#4A3D8F', badgeText: '#E8E3FB' },
  'Jazz':        { emoji: '🎷', border: '#8C5A2B', text: '#E0B589', accent: '#B8732E',       badgeBg: '#8C5A2B', badgeText: '#F5E6D3' },
  'Festival':    { emoji: '🎪', border: 'var(--gold-border)', text: 'var(--gold-text)', accent: 'var(--gold)', badgeBg: '#D4AF37', badgeText: '#0A0912' },
  'Pop':         { emoji: '🎤', border: 'var(--coral-border)', text: 'var(--coral-text)', accent: '#6B2D5C',  badgeBg: '#6B2D5C', badgeText: '#F5D5E8' },
  'Reggae':      { emoji: '🌴', border: 'var(--coral-border)', text: 'var(--coral-text)', accent: '#E8456B',  badgeBg: '#6B2D5C', badgeText: '#F5D5E8' },
  'default':     { emoji: '🎫', border: 'var(--border)',       text: 'var(--muted)',      accent: 'var(--muted-dark)', badgeBg: '#3A3830', badgeText: '#E8E3F0' },
};

function getCatInfo(category) {
  return CATEGORY_MAP[category] || CATEGORY_MAP['default'];
}

function getTimeOfDay(hour) {
  if (hour >= 6 && hour < 12) return {
    label: 'Morning',
    gradient: 'linear-gradient(135deg, #4A2800 0%, #2A1800 60%, #1A1040 100%)',
  };
  if (hour >= 12 && hour < 18) return {
    label: 'Afternoon',
    gradient: 'linear-gradient(135deg, #0D3A4A 0%, #0D2A3A 60%, #0A0912 100%)',
  };
  if (hour >= 18 && hour < 22) return {
    label: 'Evening',
    gradient: 'linear-gradient(135deg, #6B2D5C 0%, #3A1F6E 60%, #1A1040 100%)',
  };
  return {
    label: 'Night',
    gradient: 'linear-gradient(135deg, #1A1040 0%, #0D0830 60%, #0A0912 100%)',
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
    populatePage(event, id);
    loadMoreShows(event, id);
  } catch (err) {
    showError('Failed to load event.');
    console.error(err);
  }
}

function populatePage(event, rawId) {
  const info = getCatInfo(event.category);
  const date = new Date(event.start_time);
  const tod = getTimeOfDay(date.getHours());

  document.title = `${event.title} — SofiaBuzz`;

  // Hero background
  const hero = document.getElementById('detail-hero');
  const heroOverlay = document.getElementById('hero-overlay');
  if (event.image_url) {
    hero.style.backgroundImage = `url(${event.image_url})`;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
    heroOverlay.style.background = tod.gradient;
  } else {
    hero.style.background = tod.gradient;
    heroOverlay.style.background = 'linear-gradient(to bottom, transparent 20%, #0A0912 100%)';
  }

  // Badges
  const badgesEl = document.getElementById('hero-badges');
  const pills = [];
  if (event.is_featured) {
    pills.push(`<span style="background:#0A0912;color:#D4AF37;border:1px solid #D4AF37;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:1px;padding:4px 10px;font-family:'IBM Plex Sans',sans-serif;">★ FEATURED</span>`);
  }
  pills.push(`<span style="background:${info.badgeBg};color:${info.badgeText};border-radius:999px;font-size:10px;font-weight:500;padding:4px 10px;font-family:'IBM Plex Sans',sans-serif;">${info.emoji} ${event.category}</span>`);
  pills.push(`<span style="background:rgba(0,0,0,0.45);color:#B5AE9D;border-radius:999px;font-size:10px;padding:4px 10px;font-family:'IBM Plex Sans',sans-serif;">${tod.label}</span>`);
  badgesEl.innerHTML = pills.join('');

  // Title & subtitle
  document.getElementById('event-title').textContent = event.title;
  const subtitleEl = document.getElementById('event-subtitle');
  if (event.tour_name) {
    subtitleEl.textContent = event.tour_name;
  } else {
    subtitleEl.style.display = 'none';
  }

  // Info strip
  document.getElementById('info-venue').textContent = event.venue;
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('info-datetime').textContent = `${dateStr}, ${timeStr}`;

  // Description
  document.getElementById('event-description').textContent = event.description || 'No description available.';

  // Detail pills (age restriction, duration, support act)
  const pillsEl = document.getElementById('event-pills');
  const pillItems = [];
  if (event.age_restriction) pillItems.push(event.age_restriction);
  if (event.duration) pillItems.push(event.duration);
  if (event.support_act) pillItems.push(`Support: ${event.support_act}`);
  if (pillItems.length > 0) {
    pillsEl.innerHTML = pillItems.map(p =>
      `<span style="background:#2A1F3A;color:#A89AD4;border-radius:999px;font-size:11px;padding:5px 12px;font-family:'IBM Plex Sans',sans-serif;">${p}</span>`
    ).join('');
  }

  // Artist section
  const artistName = event.artist_name || event.title;
  document.getElementById('artist-name').textContent = artistName;
  document.getElementById('artist-initial').textContent = artistName.charAt(0).toUpperCase();
  const metaParts = [event.genre, event.origin].filter(Boolean);
  document.getElementById('artist-meta').textContent = metaParts.join(' · ');
  const bioEl = document.getElementById('artist-bio');
  if (event.artist_bio) {
    bioEl.textContent = event.artist_bio;
  } else {
    bioEl.innerHTML = '<em style="color:#6E6A5F;">Biography coming soon.</em>';
  }

  // Venue section
  document.getElementById('venue-name').textContent = event.venue;
  document.getElementById('venue-address').textContent = `${event.venue}, Sofia`;
  document.getElementById('maps-link').href =
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(event.venue + ', Sofia, Bulgaria');

  // Share button
  document.getElementById('share-btn').addEventListener('click', function () {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.textContent = 'Link copied!';
      setTimeout(() => { this.textContent = '🔗 Copy event link'; }, 1500);
    }).catch(() => {});
  });

  // Bottom bar
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
      container.innerHTML = '<p style="font-size:13px;color:#6E6A5F;font-style:italic;font-family:\'IBM Plex Sans\',sans-serif;">No other shows in this category right now.</p>';
      return;
    }

    container.innerHTML = others.map(e => {
      const info = getCatInfo(e.category);
      const d = new Date(e.start_time);
      const ds = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `<a href="event.html?id=${e.id}" style="display:flex;align-items:center;gap:12px;text-decoration:none;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <div style="width:38px;height:38px;border-radius:8px;background:${info.accent};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;">${info.emoji}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:500;color:#F0E8D6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'IBM Plex Sans',sans-serif;">${e.title}</div>
          <div style="font-size:11px;color:#6E6A5F;margin-top:2px;font-family:'IBM Plex Sans',sans-serif;">${e.venue} · ${ds}</div>
        </div>
        <div style="font-family:'Playfair Display',serif;font-size:14px;color:#D4AF37;flex-shrink:0;">${e.price_text || ''}</div>
      </a>`;
    }).join('');
  } catch (_) {
    container.innerHTML = '<p style="font-size:13px;color:#6E6A5F;font-style:italic;font-family:\'IBM Plex Sans\',sans-serif;">No other shows in this category right now.</p>';
  }
}

function showError(msg) {
  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;padding:2rem;background:#0A0912;">
      <div style="font-size:48px;">🎫</div>
      <p style="color:#B5AE9D;text-align:center;font-family:'IBM Plex Sans',sans-serif;">${msg}</p>
      <a href="index.html" style="color:#D4AF37;font-weight:600;text-decoration:none;font-family:'IBM Plex Sans',sans-serif;">← Back to events</a>
    </div>
  `;
}

loadEvent();
