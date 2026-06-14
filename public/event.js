const API_BASE = 'https://sofiabuzz.com';

const CATEGORY_MAP = {
  'Rock':        { emoji: '🎸', bg: 'var(--coral-bg)', text: 'var(--coral-text)', accent: 'var(--coral)' },
  'Electronic':  { emoji: '🎧', bg: 'var(--purple-bg)', text: 'var(--purple-text)', accent: 'var(--purple)' },
  'Jazz':        { emoji: '🎷', bg: 'var(--teal-bg)', text: 'var(--teal-text)', accent: '#2EC4B6' },
  'Festival':    { emoji: '🎪', bg: 'var(--gold-bg)', text: 'var(--gold-text)', accent: 'var(--gold)' },
  'Pop':         { emoji: '🎤', bg: 'var(--coral-bg)', text: 'var(--coral-text)', accent: 'var(--coral)' },
  'Reggae':      { emoji: '🌴', bg: 'var(--teal-bg)', text: 'var(--teal-text)', accent: '#2EC4B6' },
  'default':     { emoji: '🎫', bg: '#F0EEEA', text: 'var(--dark)', accent: 'var(--muted)' },
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

  // Category badge
  document.getElementById('event-category-badge').innerHTML =
    `<span class="cat-badge" style="background:${info.bg};color:${info.text};">${info.emoji} ${event.category}</span>`;

  // Ticket link in details section
  if (event.ticket_url) {
    const link = document.getElementById('ticket-link');
    link.href = event.ticket_url;
    link.style.display = 'inline-block';
  }

  // Bottom bar price
  const priceEl = document.getElementById('bottom-price-value');
  priceEl.textContent = event.price_text;
  priceEl.style.color = info.accent;

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
