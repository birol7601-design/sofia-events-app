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

let allEvents = [];
let activeCategory = 'all';

async function loadEvents() {
  const container = document.getElementById('event-list');
  try {
    const response = await fetch(`${API_BASE}/api/events`);
    allEvents = await response.json();
    buildFilterBar();
    renderEvents('all');
  } catch (err) {
    container.innerHTML = '<p style="color: var(--muted); padding: 1rem 0;">Error loading events.</p>';
    console.error(err);
  }
}

function buildFilterBar() {
  const bar = document.getElementById('filter-bar');

  const allBtn = bar.querySelector('[data-category="all"]');
  setAllBtnActive(allBtn, true);

  const categories = [...new Set(allEvents.map(e => e.category))];
  categories.forEach(cat => {
    const info = getCatInfo(cat);
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.category = cat;
    btn.textContent = `${info.emoji} ${cat}`;
    btn.style.background = info.bg;
    btn.style.color = info.text;
    btn.style.borderColor = 'transparent';
    bar.appendChild(btn);
  });
}

function setAllBtnActive(btn, active) {
  btn.style.background = 'var(--dark)';
  btn.style.color = 'var(--cream)';
  btn.style.borderColor = 'transparent';
}

function renderEvents(category) {
  activeCategory = category;
  const container = document.getElementById('event-list');
  const filtered = category === 'all'
    ? allEvents
    : allEvents.filter(e => e.category === category);

  if (filtered.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); padding: 1rem 0;">No events found.</p>';
    return;
  }

  container.innerHTML = filtered.map(event => buildCardHTML(event)).join('');
}

function buildCardHTML(event) {
  const info = getCatInfo(event.category);
  const date = new Date(event.start_time);
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const imageHTML = event.image_url
    ? `<img src="${event.image_url}" alt="${event.title}" loading="lazy">`
    : '';

  const ribbonHTML = event.is_featured
    ? `<div class="featured-ribbon">FEATURED</div>`
    : '';

  const starBadgeHTML = event.is_featured
    ? `<div class="featured-star-badge">⭐</div>`
    : '';

  const featuredClass = event.is_featured ? ' featured' : '';

  return `
    <div class="card-wrapper" onclick="window.location.href='event.html?id=${event.id}'">
      <div class="event-card${featuredClass}">
        <div class="card-image-wrap" style="background-color: ${info.accent};">
          ${imageHTML}
          ${ribbonHTML}
          <button class="heart-btn" onclick="event.stopPropagation()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="perforation-divider">
          <div class="perf-circle perf-left"></div>
          <div class="perf-circle perf-right"></div>
        </div>
        <div class="card-body">
          <div class="accent-bar" style="background: ${info.accent};"></div>
          <div class="card-content">
            <div class="card-title">${event.title}</div>
            <div class="card-meta">📍 ${event.venue}</div>
            <div class="card-meta">🕒 ${dateStr}, ${timeStr}</div>
            <hr class="content-divider" style="border-color: ${info.bg};">
            <div class="card-footer">
              <div class="price-wrap">
                <span class="price-from">from</span>
                <span class="price-value" style="color: ${info.accent};">${event.price_text}</span>
              </div>
              <span class="cat-badge" style="background: ${info.bg}; color: ${info.text};">${info.emoji} ${event.category}</span>
            </div>
          </div>
        </div>
      </div>
      ${starBadgeHTML}
    </div>
  `;
}

document.getElementById('filter-bar').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  const cat = btn.dataset.category;

  // Update button styles
  document.querySelectorAll('.filter-btn').forEach(b => {
    if (b.dataset.category === 'all') {
      setAllBtnActive(b, b === btn);
    } else {
      b.style.borderColor = 'transparent';
    }
  });

  if (cat !== 'all') {
    const info = getCatInfo(cat);
    btn.style.borderColor = info.accent;
  }

  const container = document.getElementById('event-list');
  container.classList.add('fading');

  setTimeout(() => {
    renderEvents(cat);
    container.classList.remove('fading');
  }, 200);
});

loadEvents();
