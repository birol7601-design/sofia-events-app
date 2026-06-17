const API = '';

let selectedGenres = new Set();
let selectedArtistIds = new Set();
let allArtists = [];
let currentStep = 1;

function authHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('userToken')}`, 'Content-Type': 'application/json' };
}

function toggleGenre(el) {
  const genre = el.dataset.genre;
  if (selectedGenres.has(genre)) {
    selectedGenres.delete(genre);
    el.classList.remove('selected');
  } else {
    selectedGenres.add(genre);
    el.classList.add('selected');
  }
}

function toggleArtist(id) {
  if (selectedArtistIds.has(id)) {
    selectedArtistIds.delete(id);
  } else {
    selectedArtistIds.add(id);
  }
  renderArtistGrid(document.getElementById('artist-search').value);
}

function renderArtistGrid(query) {
  const grid = document.getElementById('artist-grid');
  const filtered = query
    ? allArtists.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
    : allArtists;

  if (!filtered.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;font-family:'Cormorant Garamond',serif;color:var(--muted-dark);font-style:italic;padding:12px 0;">No artists found.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(a => `
    <div class="artist-card${selectedArtistIds.has(a.id) ? ' selected' : ''}" onclick="toggleArtist(${a.id})">
      <div style="flex-shrink:0;">${window.getAvatarSVG(a.avatar_type || 'star', 40)}</div>
      <div style="flex:1;min-width:0;">
        <div class="artist-name-text">${a.name}</div>
        <div class="artist-genre-text">${(a.genres || []).join(', ')}</div>
      </div>
    </div>`).join('');
}

function filterArtists(q) {
  renderArtistGrid(q);
}

async function loadArtists() {
  try {
    const res = await fetch(`${API}/api/artists`, { headers: authHeaders() });
    if (res.ok) {
      allArtists = await res.json();
      renderArtistGrid('');
    }
  } catch {}
}

async function nextStep() {
  if (selectedGenres.size > 0) {
    try {
      await fetch(`${API}/api/users/preferences/genres`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ genres: [...selectedGenres] })
      });
    } catch {}
  }
  goToStep(2);
}

async function finishOnboarding() {
  if (selectedArtistIds.size > 0) {
    try {
      await fetch(`${API}/api/users/preferences/artists`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ artistIds: [...selectedArtistIds] })
      });
    } catch {}
  }
  try {
    await fetch(`${API}/api/users/onboarding`, { method: 'PATCH', headers: authHeaders() });
  } catch {}
  window.location.href = 'index.html';
}

async function skip() {
  try {
    await fetch(`${API}/api/users/onboarding`, { method: 'PATCH', headers: authHeaders() });
  } catch {}
  window.location.href = 'index.html';
}

function goToStep(n) {
  document.getElementById(`step-${currentStep}`).classList.remove('active');
  currentStep = n;
  document.getElementById(`step-${n}`).classList.add('active');
  document.getElementById('dot-1').classList.toggle('active', n === 1);
  document.getElementById('dot-2').classList.toggle('active', n === 2);
}

function init() {
  if (!localStorage.getItem('userToken')) {
    window.location.href = 'auth.html';
    return;
  }
  loadArtists();
}

init();
