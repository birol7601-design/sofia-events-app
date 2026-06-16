const API = '';

function showTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('login-form').style.display = isLogin ? '' : 'none';
  document.getElementById('register-form').style.display = isLogin ? 'none' : '';
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  document.getElementById('login-error').textContent = '';
  document.getElementById('register-error').textContent = '';
}

function storeAndRedirect(data) {
  localStorage.setItem('userToken', data.token);
  localStorage.setItem('userName', data.username);
  localStorage.setItem('userAvatarColor', data.avatarColor || '#D4AF37');
  localStorage.setItem('userId', String(data.id));
  window.location.href = 'profile.html';
}

document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';

  if (!email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }

  document.getElementById('login-btn').textContent = 'Logging in…';
  document.getElementById('login-btn').disabled = true;

  try {
    const res = await fetch(`${API}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Login failed.'; return; }
    storeAndRedirect(data);
  } catch {
    errEl.textContent = 'Network error. Please try again.';
  } finally {
    document.getElementById('login-btn').textContent = 'Log in';
    document.getElementById('login-btn').disabled = false;
  }
});

document.getElementById('register-btn').addEventListener('click', async () => {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const errEl = document.getElementById('register-error');
  errEl.textContent = '';

  if (!username || !email || !password || !confirm) { errEl.textContent = 'Please fill in all fields.'; return; }
  if (username.length < 3) { errEl.textContent = 'Username must be at least 3 characters.'; return; }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
  if (password !== confirm) { errEl.textContent = 'Passwords do not match.'; return; }

  document.getElementById('register-btn').textContent = 'Creating account…';
  document.getElementById('register-btn').disabled = true;

  try {
    const regRes = await fetch(`${API}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const regData = await regRes.json();
    if (!regRes.ok) { errEl.textContent = regData.error || 'Registration failed.'; return; }

    const loginRes = await fetch(`${API}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) { window.location.href = 'auth.html'; return; }
    storeAndRedirect(loginData);
  } catch {
    errEl.textContent = 'Network error. Please try again.';
  } finally {
    document.getElementById('register-btn').textContent = 'Create account';
    document.getElementById('register-btn').disabled = false;
  }
});

['login-email', 'login-password'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
  });
});
['reg-username', 'reg-email', 'reg-password', 'reg-confirm'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('register-btn').click();
  });
});

if (localStorage.getItem('userToken')) {
  window.location.href = 'profile.html';
}
