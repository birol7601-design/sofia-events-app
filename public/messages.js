const API = '';
let myUserId = localStorage.getItem('userId');
let currentFriendId = null;
let currentFriendName = '';
let currentFriendAvatarType = 'star';
let pollInterval = null;
let lastMessageId = 0;

function authHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('userToken')}`, 'Content-Type': 'application/json' };
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' }) + ' ' + d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}

function renderMessage(msg) {
  const isMe = String(msg.sender_id) === String(myUserId);
  const time = formatTime(msg.created_at);
  return `
    <div style="display:flex;flex-direction:column;align-items:${isMe ? 'flex-end' : 'flex-start'};">
      <div style="max-width:75%;background:${isMe ? 'linear-gradient(135deg,#3A2800,#5C3D00)' : '#16151F'};border:1px solid ${isMe ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.15)'};border-radius:${isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px'};padding:10px 14px;">
        <p style="font-family:'Cormorant Garamond',serif;font-size:15px;color:#F0E8D6;margin:0;line-height:1.7;word-break:break-word;">${escapeHtml(msg.content)}</p>
      </div>
      <span style="font-size:12px;color:#6E6A5F;font-family:'Cormorant Garamond',serif;margin-top:3px;padding:0 4px;">${time}</span>
    </div>`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function loadMessages(append) {
  if (!currentFriendId) return;
  try {
    const res = await fetch(`${API}/api/messages/${currentFriendId}`, { headers: authHeaders() });
    if (!res.ok) return;
    const msgs = await res.json();
    const container = document.getElementById('chat-messages');
    if (!append) {
      container.innerHTML = msgs.length === 0
        ? `<p style="text-align:center;font-family:'Cormorant Garamond',serif;font-size:15px;color:#6E6A5F;padding:40px 0;font-style:italic;">No messages yet. Say hi!</p>`
        : msgs.map(renderMessage).join('');
      if (msgs.length > 0) lastMessageId = msgs[msgs.length - 1].id;
      container.scrollTop = container.scrollHeight;
    } else {
      const newMsgs = msgs.filter(m => m.id > lastMessageId);
      if (newMsgs.length > 0) {
        const wasAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
        newMsgs.forEach(m => {
          const div = document.createElement('div');
          div.innerHTML = renderMessage(m);
          container.appendChild(div.firstElementChild);
        });
        lastMessageId = newMsgs[newMsgs.length - 1].id;
        if (wasAtBottom) container.scrollTop = container.scrollHeight;
      }
    }
  } catch {}
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const content = input.value.trim();
  if (!content || !currentFriendId) return;
  input.value = '';
  try {
    const res = await fetch(`${API}/api/messages/${currentFriendId}`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ content })
    });
    if (res.ok) await loadMessages(true);
  } catch {}
}

function startPolling() {
  stopPolling();
  pollInterval = setInterval(() => loadMessages(true), 3000);
}

function stopPolling() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
}

function openChat(friendId, username, avatarType) {
  currentFriendId = friendId;
  currentFriendName = username;
  currentFriendAvatarType = avatarType || 'star';
  lastMessageId = 0;

  document.getElementById('conversations-view').style.display = 'none';
  document.getElementById('chat-view').style.display = '';
  document.getElementById('chat-friend-name').textContent = username;
  document.getElementById('chat-friend-avatar').innerHTML = window.getAvatarSVG(currentFriendAvatarType, 36);

  loadMessages(false);
  startPolling();
}

function backToConversations() {
  stopPolling();
  currentFriendId = null;
  document.getElementById('chat-view').style.display = 'none';
  document.getElementById('conversations-view').style.display = '';
  loadConversations();
}

async function loadConversations() {
  const container = document.getElementById('conversations-list');
  container.innerHTML = `<p style="text-align:center;color:#6E6A5F;font-family:'IBM Plex Sans',sans-serif;font-size:14px;padding:40px;">Loading…</p>`;
  try {
    const res = await fetch(`${API}/api/friends`, { headers: authHeaders() });
    if (!res.ok) { container.innerHTML = `<p style="text-align:center;color:#6E6A5F;font-family:'IBM Plex Sans',sans-serif;font-size:14px;padding:40px;">Could not load friends.</p>`; return; }
    const friends = await res.json();
    if (friends.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:48px 24px 32px;">
          <span style="display:block;font-size:48px;margin-bottom:12px;">💬</span>
          <div style="font-family:'Playfair Display',serif;color:#D4AF37;font-size:16px;font-weight:700;margin-bottom:8px;">No conversations yet</div>
          <p style="font-family:'Cormorant Garamond',serif;color:#6E6A5F;font-size:15px;margin-bottom:20px;font-style:italic;">Add friends from your profile to start chatting</p>
          <a href="profile.html" style="display:inline-block;background:linear-gradient(135deg,#F4D06F,#D4AF37,#B8860B);color:#0A0912;font-family:'IBM Plex Sans',sans-serif;font-weight:700;font-size:13px;border-radius:999px;padding:10px 24px;text-decoration:none;">Find friends →</a>
        </div>`;
      return;
    }
    container.innerHTML = friends.map(f => `
      <div onclick="openChat('${f.id}','${escapeHtml(f.username)}','${f.avatarType || 'star'}')" style="display:flex;align-items:center;gap:12px;padding:12px 10px;border-radius:12px;border:1px solid rgba(212,175,55,0.2);margin-bottom:8px;background:#16151F;cursor:pointer;">
        <div style="flex-shrink:0;">${window.getAvatarSVG(f.avatarType || 'star', 44)}</div>
        <div style="flex:1;min-width:0;">
          <div style="color:#F0E8D6;font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:500;">${escapeHtml(f.username)}</div>
          <div style="color:#6E6A5F;font-family:'Cormorant Garamond',serif;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-style:italic;">${f.bio ? escapeHtml(f.bio.substring(0,60)) : 'Tap to chat'}</div>
        </div>
        <span style="color:#D4AF37;font-size:18px;flex-shrink:0;">›</span>
      </div>`).join('');
  } catch { container.innerHTML = `<p style="text-align:center;color:#6E6A5F;padding:40px;">Error loading conversations.</p>`; }
}

async function init() {
  const token = localStorage.getItem('userToken');
  if (!token) { window.location.href = 'auth.html'; return; }
  myUserId = localStorage.getItem('userId');

  const params = new URLSearchParams(window.location.search);
  const friendId = params.get('user');
  const friendName = params.get('name');
  const friendAvatar = params.get('avatar');

  if (friendId) {
    openChat(friendId, friendName || 'Friend', friendAvatar || 'star');
  } else {
    loadConversations();
  }
}

init();
