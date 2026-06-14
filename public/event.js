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

async function loadEvent() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    showError('No event specified.');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/events/${id}`);
    if (!res.ok) {
      showError('Event not found.');
      return;
    }
    populatePage(await res.json());
  } catch (err) {
    showError('Failed to load event.');
    console.error(err);
  }
}

function populatePage(event) {
  const info = getCatInfo(event.category);

  // Hero background
  const hero = document.getElementById('hero');
  if (event.image_url) {
    hero.style.backgroundImage = `url(${event.image_url})`;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
  } else {
    hero.style.backgroundColor = info.accent;
  }

  // Featured badge
  if (event.is_featured) {
    document.getElementById('featured-badge').style.display = 'block';
  }

  // Title
  document.title = `${event.title} — SofiaBuzz`;
  document.getElementById('event-title').textContent = event.title;

  // Venue & time
  document.getElementById('event-venue').innerHTML = `📍 ${event.venue}`;
  const date = new Date(event.start_time);
  const dateStr = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('event-time').innerHTML = `🕒 ${dateStr}, ${timeStr}`;

  // Description
  document.getElementById('event-description').textContent = event.description || 'No description available.';

  // Category badge — solid fill
  document.getElementById('event-category-badge').innerHTML =
    `<span class="cat-badge" style="background:${info.badgeBg};color:${info.badgeText};">${info.emoji} ${event.category}</span>`;

  // Ticket link in details section
  if (event.ticket_url) {
    const link = document.getElementById('ticket-link');
    link.href = event.ticket_url;
    link.style.display = 'inline-block';
  }

  // Bottom bar price
  const priceEl = document.getElementById('bottom-price-value');
  priceEl.textContent = event.price_text;
  priceEl.style.color = info.text;

  // Bottom bar action
  const actionEl = document.getElementById('bottom-action');
  if (event.ticket_url) {
    actionEl.innerHTML = `<a href="${event.ticket_url}" target="_blank" rel="noopener" class="tickets-btn">Get tickets</a>`;
  } else {
    actionEl.innerHTML = `<span class="no-tickets">More info coming soon</span>`;
  }
}

function showError(msg) {
  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;padding:2rem;">
      <div style="font-size:48px;">🎫</div>
      <p style="color:var(--muted);text-align:center;">${msg}</p>
      <a href="index.html" style="color:var(--gold);font-weight:600;text-decoration:none;">← Back to events</a>
    </div>
  `;
}

loadEvent();
