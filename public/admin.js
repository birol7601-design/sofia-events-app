const API_BASE = 'https://sofiabuzz.com';
let adminToken = localStorage.getItem('adminToken') || '';
let allAdminEvents = [];

function adminHeaders() {
  return { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' };
}

async function adminLogin() {
  const pw = document.getElementById('admin-pw').value;
  const err = document.getElementById('admin-login-err');
  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw })
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.error || 'Invalid password'; return; }
    adminToken = data.token;
    localStorage.setItem('adminToken', adminToken);
    showDashboard();
  } catch { err.textContent = 'Network error'; }
}

function adminLogout() {
  localStorage.removeItem('adminToken');
  adminToken = '';
  document.getElementById('admin-login').style.display = '';
  document.getElementById('admin-dashboard').style.display = 'none';
  document.getElementById('logout-admin-btn').style.display = 'none';
}

async function showDashboard() {
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = '';
  document.getElementById('logout-admin-btn').style.display = '';
  loadStats();
  loadEvents();
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: adminHeaders() });
    if (!res.ok) return;
    const d = await res.json();
    document.getElementById('s-events').textContent = d.totalEvents;
    document.getElementById('s-users').textContent = d.totalUsers;
    document.getElementById('s-featured').textContent = d.activeFeaturedSlots;
    document.getElementById('s-events-month').textContent = d.eventsThisMonth;
    document.getElementById('s-users-month').textContent = d.usersThisMonth;
  } catch {}
}

async function loadEvents() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/events`, { headers: adminHeaders() });
    if (!res.ok) return;
    allAdminEvents = await res.json();
    renderEvents(allAdminEvents);
  } catch {}
}

function renderEvents(events) {
  const container = document.getElementById('admin-events-list');
  if (!events.length) { container.innerHTML = '<p style="color:#8B6040;font-family:\'Cormorant Garamond\',serif;font-style:italic;">No events.</p>'; return; }
  container.innerHTML = events.map(e => `
    <div class="admin-row">
      <div class="title">${escHtml(e.title)}<br><span style="font-size:11px;color:#6E6A5F;">${e.venue} · ${e.category}${e.deleted ? ' · <span style="color:#FF4040;">DELETED</span>' : ''}${!e.approved ? ' · <span style="color:#FF8C00;">UNAPPROVED</span>' : ''}</span></div>
      <button class="btn-sm btn-approve" onclick="adminApprove(${e.id},true)">✓</button>
      <button class="btn-sm btn-reject"  onclick="adminApprove(${e.id},false)">✗</button>
      <button class="btn-sm btn-delete"  onclick="adminDelete(${e.id})">🗑</button>
    </div>`).join('');
}

function filterEvents() {
  const q = document.getElementById('event-search').value.toLowerCase();
  renderEvents(allAdminEvents.filter(e => e.title.toLowerCase().includes(q) || (e.venue||'').toLowerCase().includes(q)));
}

async function adminApprove(id, approve) {
  const endpoint = approve ? 'approve' : 'reject';
  await fetch(`${API_BASE}/api/admin/events/${id}/${endpoint}`, { method: 'POST', headers: adminHeaders() });
  loadEvents();
}

async function adminDelete(id) {
  if (!confirm('Delete this event?')) return;
  await fetch(`${API_BASE}/api/admin/events/${id}`, { method: 'DELETE', headers: adminHeaders() });
  loadEvents();
}

async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, { headers: adminHeaders() });
    if (!res.ok) return;
    const users = await res.json();
    const container = document.getElementById('admin-users-list');
    if (!users.length) { container.innerHTML = '<p style="color:#8B6040;font-family:\'Cormorant Garamond\',serif;font-style:italic;">No users.</p>'; return; }
    container.innerHTML = users.map(u => `
      <div class="admin-row">
        <div class="title">${escHtml(u.username)}<br><span style="font-size:11px;color:#6E6A5F;">${escHtml(u.email)} · ${u.email_verified ? '✓ verified' : '⚠ unverified'}</span></div>
        <button class="btn-sm btn-delete" onclick="adminDeleteUser(${u.id},'${escHtml(u.username)}')">Ban</button>
      </div>`).join('');
  } catch {}
}

async function adminDeleteUser(id, name) {
  if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
  await fetch(`${API_BASE}/api/admin/users/${id}`, { method: 'DELETE', headers: adminHeaders() });
  loadUsers();
}

async function loadSlots() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/featured-slots`, { headers: adminHeaders() });
    if (!res.ok) return;
    const slots = await res.json();
    const container = document.getElementById('admin-slots-list');
    if (!slots.length) { container.innerHTML = '<p style="color:#8B6040;font-family:\'Cormorant Garamond\',serif;font-style:italic;">No featured slots.</p>'; return; }
    container.innerHTML = slots.map(s => `
      <div class="admin-row">
        <div class="title">Slot ${s.slot_number}${s.event_title ? ` — ${escHtml(s.event_title)}` : ''}<br><span style="font-size:11px;color:#6E6A5F;">${s.start_date ? new Date(s.start_date).toLocaleDateString() : 'inactive'} → ${s.end_date ? new Date(s.end_date).toLocaleDateString() : ''}</span></div>
        <button class="btn-sm btn-gold" onclick="activateSlot(${s.id})">Activate 30d</button>
      </div>`).join('');
  } catch {}
}

async function activateSlot(id) {
  await fetch(`${API_BASE}/api/admin/featured-slots/${id}/activate`, { method: 'POST', headers: adminHeaders() });
  loadSlots();
}

async function adminAddEvent() {
  const msg = document.getElementById('qa-msg');
  const body = {
    title:       document.getElementById('qa-title').value.trim(),
    description: document.getElementById('qa-desc').value.trim(),
    artist_bio:  document.getElementById('qa-bio').value.trim() || null,
    category:    document.getElementById('qa-category').value.trim(),
    venue:       document.getElementById('qa-venue').value.trim(),
    start_time:  document.getElementById('qa-start').value,
    price_text:  document.getElementById('qa-price').value.trim(),
    ticket_url:  document.getElementById('qa-ticket').value.trim() || null,
    image_url:   document.getElementById('qa-image').value.trim() || null,
  };
  if (!body.title || !body.category || !body.venue || !body.start_time) { msg.style.color='#E8456B'; msg.textContent='Title, category, venue and date are required.'; return; }
  try {
    const res = await fetch(`${API_BASE}/api/admin/events`, {
      method: 'POST', headers: adminHeaders(), body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) { msg.style.color='#E8456B'; msg.textContent = data.error || 'Error adding event'; return; }
    msg.style.color='#FF8C00'; msg.textContent = `Event "${data.title}" added ✓`;
    loadStats(); loadEvents();
  } catch { msg.style.color='#E8456B'; msg.textContent='Network error'; }
}

function switchTab(tab) {
  ['events','users','slots','add'].forEach(t => {
    document.getElementById(`tab-${t}`).style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('.admin-tab-btn').forEach((b, i) => {
    b.classList.toggle('active', ['events','users','slots','add'][i] === tab);
  });
  if (tab === 'users') loadUsers();
  if (tab === 'slots') loadSlots();
}

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Auto-login if token exists
if (adminToken) {
  showDashboard();
}
