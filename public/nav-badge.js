(async function addMessageBadge() {
  const token = localStorage.getItem('userToken');
  if (!token) return;
  try {
    const res = await fetch('https://sofiabuzz.com/api/messages/unread-count', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const { count } = await res.json();
    if (count > 0) {
      const navMsg = document.getElementById('nav-messages');
      if (navMsg && !navMsg.querySelector('.unread-dot')) {
        const dot = document.createElement('span');
        dot.className = 'unread-dot';
        dot.style.cssText = 'position:absolute;top:-2px;right:-2px;width:8px;height:8px;border-radius:50%;background:#FF8C00;pointer-events:none;';
        navMsg.style.position = 'relative';
        navMsg.appendChild(dot);
      }
    }
  } catch {}
})();
