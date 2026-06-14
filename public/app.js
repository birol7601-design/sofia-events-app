const API_BASE = 'https://sofiabuzz.com';

let allEvents = [];

async function loadEvents() {
  const container = document.getElementById('event-list');
  try {
    const response = await fetch(`${API_BASE}/api/events`);
    allEvents = await response.json();
    buildFilterBar();
    renderEvents('all');
  } catch (err) {
    container.innerHTML = '<p>Error loading events.</p>';
    console.error(err);
  }
}

function buildFilterBar() {
  const bar = document.getElementById('filter-bar');
  const categories = [...new Set(allEvents.map(e => e.category))];

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.category = cat;
    btn.textContent = cat;
    bar.appendChild(btn);
  });
}

function renderEvents(category) {
  const container = document.getElementById('event-list');
  const filtered = category === 'all'
    ? allEvents
    : allEvents.filter(e => e.category === category);

  if (filtered.length === 0) {
    container.innerHTML = '<p>No events found.</p>';
    return;
  }

  container.innerHTML = filtered.map(event => {
    const date = new Date(event.start_time);
    const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const img = event.image_url || 'https://picsum.photos/seed/default/600/340';
    const featuredClass = event.is_featured ? ' featured' : '';
    const featuredBadge = event.is_featured
      ? '<span class="featured-badge">⭐ Featured</span>'
      : '';

    return `
      <div class="event-card${featuredClass}">
        <img class="event-image" src="${img}" alt="${event.title}" loading="lazy">
        <div class="event-body">
          ${featuredBadge}
          <div class="event-title">${event.title}</div>
          <div class="event-meta">${event.venue} · ${dateStr}, ${timeStr}</div>
          <div class="event-footer">
            <span class="event-price">${event.price_text}</span>
            <span class="event-category">${event.category}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('filter-bar').addEventListener('click', (e) => {
  if (!e.target.classList.contains('filter-btn')) return;

  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  const container = document.getElementById('event-list');
  container.classList.add('fading');

  setTimeout(() => {
    renderEvents(e.target.dataset.category);
    container.classList.remove('fading');
  }, 200);
});

loadEvents();