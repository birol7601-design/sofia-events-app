const API = 'https://sofiabuzz.com';

function togglePw(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁';
}

function showTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('login-form').style.display = isLogin ? '' : 'none';
  document.getElementById('register-form').style.display = isLogin ? 'none' : '';
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  document.getElementById('login-error').textContent = '';
  document.getElementById('register-error').textContent = '';
}

function storeAndRedirect(data, isNewUser) {
  localStorage.setItem('userToken', data.token);
  localStorage.setItem('userName', data.username);
  localStorage.setItem('userAvatarColor', data.avatarColor || '#FF8C00');
  localStorage.setItem('userId', String(data.id));
  localStorage.setItem('userAvatarType', data.avatarType || 'star');
  if (isNewUser || !data.onboardingComplete) {
    window.location.href = 'onboarding.html';
  } else {
    window.location.href = 'home.html';
  }
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
    storeAndRedirect(data, false);
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
  const emailMarketing = document.getElementById('email-consent').checked;
  const privacyConsent = document.getElementById('privacy-consent').checked;
  const errEl = document.getElementById('register-error');
  errEl.textContent = '';

  if (!username || !email || !password || !confirm) { errEl.textContent = 'Please fill in all fields.'; return; }
  if (username.length < 3 || username.length > 30) { errEl.textContent = 'Username must be 3–30 characters.'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = 'Please enter a valid email address.'; return; }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
  if (password !== confirm) { errEl.textContent = 'Passwords do not match.'; return; }
  if (!privacyConsent) { errEl.textContent = 'Please accept the Privacy Policy to continue.'; return; }

  document.getElementById('register-btn').textContent = 'Creating account…';
  document.getElementById('register-btn').disabled = true;

  try {
    const regRes = await fetch(`${API}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, email_marketing: emailMarketing })
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
    storeAndRedirect(loginData, true);
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
  window.location.href = 'home.html';
} else if (!localStorage.getItem('hasVisitedAuth')) {
  localStorage.setItem('hasVisitedAuth', 'true');
  showTab('register');
}
