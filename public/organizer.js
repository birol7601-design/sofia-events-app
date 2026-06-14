const API = '';
let token = localStorage.getItem('organizerToken');
let organizerName = localStorage.getItem('organizerName');
let organizerEvents = [];
let selectedDays = null;
let selectedSlot = null;

if (token) {
  showDashboard();
}

document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  try {
    const res = await fetch(`${API}/api/organizers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Login failed';
      return;
    }

    token = data.token;
    organizerName = data.name;
    localStorage.setItem('organizerToken', token);
    localStorage.setItem('organizerName', organizerName);
    showDashboard();
  } catch (err) {
    errorEl.textContent = 'Something went wrong';
    console.error(err);
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('organizerToken');
  localStorage.removeItem('organizerName');
  token = null;
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('dashboard-section').style.display = 'none';
});

document.getElementById('add-event-btn').addEventListener('click', async () => {
  const errorEl = document.getElementById('add-error');
  errorEl.textContent = '';

  const title = document.getElementById('new-title').value;
  const startTime = document.getElementById('new-start').value;

  if (!title || !startTime) {
    errorEl.textContent = 'Title and date/time are required.';
    return;
  }

  const body = {
    title: title,
    description: document.getElementById('new-description').value,
    category: document.getElementById('new-category').value,
    venue: document.getElementById('new-venue').value,
    start_time: startTime,
    price_text: document.getElementById('new-price').value,
    ticket_url: document.getElementById('new-ticket-url').value,
    image_url: document.getElementById('new-image-url').value || null
  };

  try {
    const res = await fetch(`${API}/api/organizer/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Could not add event';
      return;
    }

    document.getElementById('new-title').value = '';
    document.getElementById('new-description').value = '';
    document.getElementById('new-category').value = '';
    document.getElementById('new-venue').value = '';
    document.getElementById('new-start').value = '';
    document.getElementById('new-price').value = '';
    document.getElementById('new-ticket-url').value = '';
    document.getElementById('new-image-url').value = '';

    loadOrganizerEvents();
  } catch (err) {
    errorEl.textContent = 'Something went wrong';
    console.error(err);
  }
});

function showDashboard() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('dashboard-section').style.display = 'block';
  document.getElementById('organizer-name').textContent = `Welcome, ${organizerName}`;
  loadOrganizerEvents();
  loadSlotAvailability();
}

async function loadOrganizerEvents() {
  const container = document.getElementById('organizer-events');
  try {
    const res = await fetch(`${API}/api/organizer/events`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const events = await res.json();
    organizerEvents = events;
    populatePromoteSelect();

    if (events.length === 0) {
      container.innerHTML = '<p>No events yet — add your first one below.</p>';
      return;
    }

    container.innerHTML = events.map(e => {
      const date = new Date(e.start_time);
      const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="org-event-card">
          <div class="title">${e.title}</div>
          <div class="meta">${e.venue} · ${dateStr}, ${timeStr} · ${e.category}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<p>Error loading events.</p>';
    console.error(err);
  }
}

function populatePromoteSelect() {
  const sel = document.getElementById('promote-event-select');
  sel.innerHTML = '<option value="">— select an event —</option>';
  organizerEvents.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.id;
    opt.textContent = e.title;
    sel.appendChild(opt);
  });
}

async function loadSlotAvailability() {
  const grid = document.getElementById('slot-grid');
  grid.innerHTML = '<p style="font-size:13px;color:#aaa;">Loading slots…</p>';
  try {
    const res = await fetch(`${API}/api/featured-slots/availability`);
    const taken = await res.json();
    renderSlotGrid(taken);
  } catch (err) {
    grid.innerHTML = '<p class="error-text">Could not load slot availability.</p>';
  }
}

function renderSlotGrid(taken) {
  const takenMap = {};
  taken.forEach(s => { takenMap[s.slot_number] = s; });

  const grid = document.getElementById('slot-grid');
  grid.innerHTML = '';
  selectedSlot = null;

  for (let i = 1; i <= 6; i++) {
    const info = takenMap[i];
    const btn = document.createElement('button');
    btn.dataset.slot = i;

    if (info) {
      btn.className = 'slot-btn taken';
      btn.disabled = true;
      const until = new Date(info.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      btn.innerHTML = `<span class="slot-number">Slot ${i}</span><span>Until ${until}</span>`;
    } else {
      btn.className = 'slot-btn available';
      btn.innerHTML = `<span class="slot-number">Slot ${i}</span><span>Available</span>`;
      btn.addEventListener('click', () => {
        selectedSlot = i;
        document.querySelectorAll('.slot-btn.available, .slot-btn.selected').forEach(b => {
          b.classList.remove('selected');
          b.classList.add('available');
        });
        btn.classList.remove('available');
        btn.classList.add('selected');
        checkPromoteReady();
      });
    }

    grid.appendChild(btn);
  }

  checkPromoteReady();
}

function checkPromoteReady() {
  const eventId = document.getElementById('promote-event-select').value;
  document.getElementById('promote-btn').disabled = !(eventId && selectedDays && selectedSlot);
}

document.querySelectorAll('.package-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.package-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDays = parseInt(btn.dataset.days);
    checkPromoteReady();
  });
});

document.getElementById('promote-event-select').addEventListener('change', checkPromoteReady);

document.getElementById('promote-btn').addEventListener('click', async () => {
  const errorEl = document.getElementById('promote-error');
  const successEl = document.getElementById('promote-success');
  errorEl.textContent = '';
  successEl.textContent = '';

  const eventId = document.getElementById('promote-event-select').value;

  try {
    const res = await fetch(`${API}/api/organizer/featured-slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ event_id: parseInt(eventId), slot_number: selectedSlot, days: selectedDays })
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Booking failed';
      return;
    }

    successEl.textContent = `Slot ${selectedSlot} booked for ${selectedDays} days!`;
    document.getElementById('promote-event-select').value = '';
    document.querySelectorAll('.package-btn').forEach(b => b.classList.remove('active'));
    selectedDays = null;
    loadSlotAvailability();
    checkPromoteReady();
  } catch (err) {
    errorEl.textContent = 'Something went wrong';
    console.error(err);
  }
});