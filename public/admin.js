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
      <div class="title">${escHtml(e.title)}<br><span style="font-size:11px;color:#6E6A5F;">${escHtml(e.venue||'')} · ${escHtml(e.category||'')}${e.deleted ? ' · <span style="color:#FF4040;">DELETED</span>' : ''}${!e.approved ? ' · <span style="color:#FF8C00;">UNAPPROVED</span>' : ''}</span></div>
      <button class="btn-sm btn-edit"    onclick="openEditModal(${e.id})">✏</button>
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
  loadPending();
}

async function adminDelete(id) {
  if (!confirm('Delete this event?')) return;
  await fetch(`${API_BASE}/api/admin/events/${id}`, { method: 'DELETE', headers: adminHeaders() });
  loadEvents();
  loadPending();
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

// ── Aggregation ──────────────────────────────────────────────────────────────

async function fetchEventbrite() {
  const btn  = document.getElementById('fetch-eb-btn');
  const icon = document.getElementById('fetch-eb-icon');
  const box  = document.getElementById('agg-result');
  const inner = document.getElementById('agg-result-inner');

  btn.disabled = true;
  icon.textContent = '⏳';

  try {
    const res  = await fetch(`${API_BASE}/api/admin/aggregate/eventbrite`, {
      method: 'POST', headers: adminHeaders()
    });
    const data = await res.json();

    box.style.display = '';
    if (!res.ok) {
      box.style.borderColor = 'rgba(255,70,0,0.35)';
      inner.innerHTML = `<span style="color:#FF6B35;">⚠ ${escHtml(data.error || 'Request failed')}</span>`;
    } else {
      box.style.borderColor = 'rgba(255,140,0,0.35)';
      const warn = data.warning ? `<br><span style="color:#FF8C00;font-size:12px;">⚠ ${escHtml(data.warning)}</span>` : '';
      const errs = data.errors && data.errors.length
        ? `<br><span style="color:#FF6B35;font-size:11px;">Errors: ${data.errors.map(escHtml).join(', ')}</span>` : '';
      inner.innerHTML = `
        <div class="agg-stat">Fetched <span>${data.fetched}</span></div>
        <div class="agg-stat">Inserted <span>${data.inserted}</span></div>
        <div class="agg-stat">Skipped <span>${data.skipped}</span></div>
        <div class="agg-stat">Method <span>${escHtml(data.method||'—')}</span></div>
        ${warn}${errs}
        <br><span style="font-size:12px;color:#8B6040;">Review new events in the ⏳ Pending tab.</span>
      `;

      if (data.inserted > 0) loadPending();
    }
  } catch (err) {
    box.style.display = '';
    box.style.borderColor = 'rgba(255,70,0,0.35)';
    inner.innerHTML = `<span style="color:#FF6B35;">Network error: ${escHtml(err.message)}</span>`;
  } finally {
    btn.disabled = false;
    icon.textContent = '🔄';
  }
}

async function loadPending() {
  const container = document.getElementById('admin-pending-list');
  try {
    const res = await fetch(`${API_BASE}/api/admin/pending-events`, { headers: adminHeaders() });
    if (!res.ok) { container.innerHTML = `<p style="color:#FF6B35;font-family:'IBM Plex Sans',sans-serif;font-size:13px;">Failed to load (${res.status})</p>`; return; }
    const events = await res.json();
    renderPendingEvents(events, container);
  } catch (err) {
    container.innerHTML = `<p style="color:#FF6B35;font-family:'IBM Plex Sans',sans-serif;font-size:13px;">Network error</p>`;
  }
}

function renderPendingEvents(events, container) {
  if (!events.length) {
    container.innerHTML = '<p style="color:#6E6A5F;font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:15px;">No pending events — queue is clear ✓</p>';
    return;
  }
  container.innerHTML = events.map(e => {
    const thumb = e.image_url
      ? `<img class="pending-thumb" src="${escHtml(e.image_url)}" alt="" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="pending-thumb-placeholder">🎵</div>`;
    const date = e.start_time ? new Date(e.start_time).toLocaleString('bg-BG', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';
    const source = e.source || 'manual';
    const sourceBadge = e.source_url
      ? `<a href="${escHtml(e.source_url)}" target="_blank" rel="noopener" class="source-badge ${escHtml(source)}">${escHtml(source)}</a>`
      : `<span class="source-badge ${escHtml(source)}">${escHtml(source)}</span>`;
    return `
      <div class="pending-card">
        ${thumb}
        <div class="pending-body">
          <p class="pending-title">${escHtml(e.title)}</p>
          <p class="pending-meta">${escHtml(e.venue||'Unknown venue')} · ${date} · ${sourceBadge}</p>
          <div class="pending-actions">
            <button class="btn-sm btn-approve" onclick="adminApprove(${e.id},true)">✓ Approve</button>
            <button class="btn-sm btn-edit"    onclick="openEditModal(${e.id})">✏ Edit</button>
            <button class="btn-sm btn-delete"  onclick="adminDelete(${e.id})">✗ Reject</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function openEditModal(id) {
  const ev = allAdminEvents.find(e => e.id === id);
  if (!ev) { alert('Event not in local list — reload Events tab first.'); return; }
  document.getElementById('edit-id').value      = ev.id;
  document.getElementById('edit-title').value   = ev.title || '';
  document.getElementById('edit-desc').value    = ev.description || '';
  document.getElementById('edit-category').value = ev.category || '';
  document.getElementById('edit-venue').value   = ev.venue || '';
  document.getElementById('edit-start').value   = ev.start_time ? ev.start_time.slice(0,16) : '';
  document.getElementById('edit-price').value   = ev.price_text || '';
  document.getElementById('edit-ticket').value  = ev.ticket_url || '';
  document.getElementById('edit-image').value   = ev.image_url || '';
  document.getElementById('edit-msg').textContent = '';
  document.getElementById('edit-modal').classList.add('open');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('open');
}

async function saveEdit() {
  const id  = document.getElementById('edit-id').value;
  const msg = document.getElementById('edit-msg');
  const body = {
    title:       document.getElementById('edit-title').value.trim(),
    description: document.getElementById('edit-desc').value.trim(),
    category:    document.getElementById('edit-category').value.trim(),
    venue:       document.getElementById('edit-venue').value.trim(),
    start_time:  document.getElementById('edit-start').value,
    price_text:  document.getElementById('edit-price').value.trim(),
    ticket_url:  document.getElementById('edit-ticket').value.trim() || null,
    image_url:   document.getElementById('edit-image').value.trim() || null,
  };
  try {
    const res = await fetch(`${API_BASE}/api/admin/events/${id}`, {
      method: 'PATCH', headers: adminHeaders(), body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) { msg.style.color='#FF6B35'; msg.textContent = data.error || 'Error saving'; return; }
    msg.style.color='#40E080'; msg.textContent = 'Saved ✓';
    setTimeout(closeEditModal, 700);
    loadEvents();
  } catch { msg.style.color='#FF6B35'; msg.textContent='Network error'; }
}

// ── Tab routing ───────────────────────────────────────────────────────────────

const ALL_TABS = ['events', 'pending', 'aggregate', 'users', 'slots', 'add'];

function switchTab(tab) {
  ALL_TABS.forEach(t => {
    document.getElementById(`tab-${t}`).style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('.admin-tab-btn').forEach((b, i) => {
    b.classList.toggle('active', ALL_TABS[i] === tab);
  });
  if (tab === 'users')   loadUsers();
  if (tab === 'slots')   loadSlots();
  if (tab === 'pending') loadPending();
}

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Close modal on backdrop click
document.getElementById('edit-modal').addEventListener('click', function(e) {
  if (e.target === this) closeEditModal();
});

// Auto-login if token exists
if (adminToken) {
  showDashboard();
}
