const API_BASE = '';

const GOLD_GRADIENT = 'linear-gradient(135deg, #F4D06F 0%, #D4AF37 50%, #B8860B 100%)';

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

const CORNER_SVG = (cls) => `<svg class="corner-flourish ${cls}" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 4 L8 4 Q4 4 4 8 L4 24" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="24" cy="4" r="2.5" fill="var(--gold)"/>
  <circle cx="4" cy="24" r="2.5" fill="var(--gold)"/>
  <path d="M17 4 L17 8" stroke="var(--gold)" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
  <path d="M4 17 L8 17" stroke="var(--gold)" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
</svg>`;

let allEvents = [];
let activeCategory = 'all';
let savedIds = [];
let attendingIds = [];

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
    const color = localStorage.getItem('userAvatarColor') || '#D4AF37';
    navProfile.innerHTML = `<span class="nav-icon" style="width:22px;height:22px;border-radius:50%;background:${color};color:#0A0912;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${initial}</span><span class="nav-label">Profile</span>`;
  }
}

async function fetchUserIds() {
  const token = localStorage.getItem('userToken');
  if (!token) return;
  try {
    const [savedRes, attendingRes] = await Promise.all([
      fetch(`${API_BASE}/api/users/saved/ids`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_BASE}/api/users/attending/ids`, { headers: { 'Authorization': `Bearer ${token}` } }),
    ]);
    if (savedRes.ok) { const d = await savedRes.json(); savedIds = d.savedIds.map(String); }
    if (attendingRes.ok) { const d = await attendingRes.json(); attendingIds = d.attendingIds.map(String); }
  } catch {}
}

async function handleHeartClick(domEvent, eventId) {
  domEvent.stopPropagation();
  const btn = domEvent.currentTarget;
  const path = btn.querySelector('path');
  const token = localStorage.getItem('userToken');

  if (!token) { window.location.href = 'auth.html'; return; }

  try {
    const res = await fetch(`${API_BASE}/api/users/saved/${eventId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.saved) {
        savedIds.push(String(eventId));
        path.setAttribute('fill', '#D4AF37');
        path.setAttribute('stroke', '#D4AF37');
      } else {
        savedIds = savedIds.filter(id => id !== String(eventId));
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'white');
      }
    }
  } catch {}
}

async function handleGoingClick(domEvent, eventId) {
  domEvent.stopPropagation();
  const btn = domEvent.currentTarget;
  const token = localStorage.getItem('userToken');

  if (!token) { window.location.href = 'auth.html'; return; }

  try {
    const res = await fetch(`${API_BASE}/api/users/attending/${eventId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.attending) {
        attendingIds.push(String(eventId));
        btn.classList.add('attending');
        btn.textContent = "Going ✓";
      } else {
        attendingIds = attendingIds.filter(id => id !== String(eventId));
        btn.classList.remove('attending');
        btn.textContent = "Going";
      }
    }
  } catch {}
}

function restoreCardStates() {
  document.querySelectorAll('.heart-btn[data-event-id]').forEach(btn => {
    const path = btn.querySelector('path');
    if (savedIds.includes(String(btn.dataset.eventId))) {
      path.setAttribute('fill', '#D4AF37');
      path.setAttribute('stroke', '#D4AF37');
    } else {
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'white');
    }
  });
  document.querySelectorAll('.going-card-btn[data-event-id]').forEach(btn => {
    if (attendingIds.includes(String(btn.dataset.eventId))) {
      btn.classList.add('attending');
      btn.textContent = "Going ✓";
    } else {
      btn.classList.remove('attending');
      btn.textContent = "Going";
    }
  });
}

async function loadEvents() {
  const container = document.getElementById('event-list');
  try {
    const response = await fetch(`${API_BASE}/api/events`);
    allEvents = await response.json();
    await fetchUserIds();
    buildFilterBar();
    renderEvents('all');
    initNav();
  } catch (err) {
    container.innerHTML = '<p style="color:var(--muted);padding:1rem 0;">Error loading events.</p>';
    console.error(err);
  }
}

function buildFilterBar() {
  const bar = document.getElementById('filter-bar');

  const allBtn = bar.querySelector('[data-category="all"]');
  styleAllBtn(allBtn);

  const categories = [...new Set(allEvents.map(e => e.category))];
  categories.forEach(cat => {
    const info = getCatInfo(cat);
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.category = cat;
    btn.textContent = `${info.emoji} ${cat}`;
    styleCatBtn(btn, info);
    bar.appendChild(btn);
  });
}

function styleAllBtn(btn) {
  btn.style.background = GOLD_GRADIENT;
  btn.style.color = 'var(--bg)';
  btn.style.borderColor = 'transparent';
  btn.style.opacity = '1';
}

function styleCatBtn(btn, info) {
  btn.style.background = 'transparent';
  btn.style.color = info.text;
  btn.style.border = `1px solid ${info.border}`;
  btn.style.opacity = '1';
}

function renderEvents(category) {
  activeCategory = category;
  const container = document.getElementById('event-list');
  const filtered = category === 'all'
    ? allEvents
    : allEvents.filter(e => e.category === category);

  if (filtered.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);padding:1rem 0;">No events found.</p>';
    return;
  }

  container.innerHTML = filtered.map(event => buildCardHTML(event)).join('');
  restoreCardStates();
}

function buildCardHTML(event) {
  const info = getCatInfo(event.category);
  const date = new Date(event.start_time);
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const imageHTML = event.image_url
    ? `<img src="${event.image_url}" alt="${event.title}" loading="lazy">`
    : '';

  const heartBtn = `
    <button class="heart-btn" data-event-id="${event.id}" onclick="handleHeartClick(event, '${event.id}')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>`;

  const goingBtn = `<button class="going-btn going-card-btn" data-event-id="${event.id}" onclick="handleGoingClick(event, '${event.id}')">Going</button>`;

  const cardInner = `
    <div class="event-card${event.is_featured ? ' featured' : ''}">
      <div class="card-image-wrap" style="background-color:${info.accent};">
        ${imageHTML}
        ${heartBtn}
      </div>
      <div class="perforation-divider">
        <div class="perf-circle perf-left"></div>
        <div class="perf-circle perf-right"></div>
      </div>
      <div class="card-body">
        <div class="accent-bar" style="background:${info.accent};"></div>
        <div class="card-content">
          <div class="card-title">${event.title}</div>
          <div class="card-meta">📍 ${event.venue}</div>
          <div class="card-meta">🕒 ${dateStr}, ${timeStr}</div>
          <hr class="content-divider">
          <div class="card-footer">
            <div class="price-wrap">
              <span class="price-from">from</span>
              <span class="price-value" style="color:${info.text};">${event.price_text}</span>
            </div>
            <span class="cat-badge" style="background:${info.badgeBg};color:${info.badgeText};">${info.emoji} ${event.category}</span>
          </div>
          ${goingBtn}
        </div>
      </div>
    </div>`;

  if (event.is_featured) {
    return `
      <div class="card-wrapper featured-frame" onclick="window.location.href='event.html?id=${event.id}'">
        ${CORNER_SVG('fl-tl')}
        ${CORNER_SVG('fl-tr')}
        ${CORNER_SVG('fl-br')}
        ${CORNER_SVG('fl-bl')}
        <div class="featured-placard">✦ Featured</div>
        ${cardInner}
      </div>`;
  }

  return `
    <div class="card-wrapper" onclick="window.location.href='event.html?id=${event.id}'">
      ${cardInner}
    </div>`;
}

document.getElementById('filter-bar').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  const cat = btn.dataset.category;

  document.querySelectorAll('.filter-btn').forEach(b => {
    if (b.dataset.category === 'all') {
      styleAllBtn(b);
    } else {
      const info = getCatInfo(b.dataset.category);
      styleCatBtn(b, info);
      b.style.opacity = cat === 'all' ? '1' : '0.5';
    }
  });

  if (cat !== 'all') {
    btn.style.opacity = '1';
  }

  const container = document.getElementById('event-list');
  container.classList.add('fading');
  setTimeout(() => {
    renderEvents(cat);
    container.classList.remove('fading');
  }, 200);
});

loadEvents();
