const API = 'https://sofiabuzz.com';

const CAT_COLORS = {
  Rock: '#6B1A00', Electronic: '#3D1F80', Jazz: '#804000',
  Festival: '#CC4400', Pop: '#801A3D', Reggae: '#1A5020', default: '#2A1200'
};

let activeTab = 'about';
let artistData = null;

function authHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` };
}

function showTab(tab) {
  activeTab = tab;
  ['about', 'upcoming', 'past'].forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    if (el) el.style.display = t === tab ? '' : 'none';
    const btn = document.querySelector(`.artist-tab:nth-child(${['about','upcoming','past'].indexOf(t)+1})`);
    if (btn) btn.classList.toggle('active', t === tab);
  });
}

function formatDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderEventRow(ev) {
  const color = CAT_COLORS[ev.category] || CAT_COLORS.default;
  return `
    <div class="artist-event-row" onclick="window.location.href='event.html?id=${ev.id}'">
      <div class="artist-event-square" style="background:${color};${ev.image_url ? `background-image:url('${ev.image_url}');background-size:cover;background-position:center;` : ''}"></div>
      <div style="flex:1;min-width:0;">
        <div style="font-family:'DM Serif Display',serif;font-style:italic;font-size:16px;color:var(--cream);line-height:1.2;">${ev.title}</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:13px;color:var(--muted-dark);margin-top:2px;">${ev.venue} · ${formatDate(ev.start_time)}</div>
      </div>
      <span style="color:var(--gold);font-size:18px;flex-shrink:0;">›</span>
    </div>`;
}

function renderEventList(containerId, events, emptyMsg) {
  const el = document.getElementById(containerId);
  if (!events || !events.length) {
    el.innerHTML = `<p style="font-family:'Cormorant Garamond',serif;font-size:15px;color:var(--muted-dark);font-style:italic;padding:20px 0;">${emptyMsg}</p>`;
    return;
  }
  el.innerHTML = events.map(renderEventRow).join('');
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get('id');
  if (!artistId) { window.location.href = 'index.html'; return; }

  try {
    const res = await fetch(`${API}/api/artists/${artistId}`, { headers: authHeaders() });
    if (!res.ok) { window.location.href = 'index.html'; return; }
    artistData = await res.json();

    document.title = `${artistData.name} — SofiaBuzz`;
    document.getElementById('artist-name').textContent = artistData.name;
    document.getElementById('artist-genres').textContent = (artistData.genres || []).join(' · ');
    document.getElementById('artist-bio').textContent = artistData.bio || '';

    const avatarEl = document.getElementById('artist-avatar-hero');
    avatarEl.innerHTML = window.getAvatarSVG(artistData.avatar_type || 'star', 56);

    const heroGradient = artistData.genres && artistData.genres[0]
      ? { Rock: 'linear-gradient(135deg,#3D0A00,#6B1A00)', Electronic: 'linear-gradient(135deg,#0D0020,#3D1F80)',
          Jazz: 'linear-gradient(135deg,#1A0A00,#804000)', Festival: 'linear-gradient(135deg,#2A0800,#CC4400)',
          Pop: 'linear-gradient(135deg,#1A0008,#801A3D)', Reggae: 'linear-gradient(135deg,#001A08,#1A5020)',
          default: 'linear-gradient(135deg,#1A0A00,#2A1200)' }[artistData.genres[0]] || ''
      : '';
    if (heroGradient) document.getElementById('artist-hero-bg').style.background = heroGradient;

    renderEventList('upcoming-list', artistData.upcoming, 'No upcoming shows scheduled.');
    renderEventList('past-list', artistData.past, 'No past shows recorded.');

  } catch (err) {
    console.error(err);
  }
}

init();
