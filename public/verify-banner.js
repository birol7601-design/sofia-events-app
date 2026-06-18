(async function showVerifyBanner() {
  const token = localStorage.getItem('userToken');
  if (!token) return;
  if (sessionStorage.getItem('verifyBannerDismissed')) return;
  try {
    const res = await fetch('https://sofiabuzz.com/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const user = await res.json();
    if (user.email_verified) return;

    const banner = document.createElement('div');
    banner.id = 'verify-banner';
    banner.style.cssText = 'background:rgba(255,140,0,0.12);border-left:3px solid #FF8C00;border-radius:0 8px 8px 0;padding:10px 14px;margin:8px 14px 0;display:flex;align-items:center;gap:10px;';
    banner.innerHTML = `
      <span style="flex:1;font-family:'Cormorant Garamond',serif;font-size:14px;color:#FFD199;">
        📧 Потвърди имейла си, за да отключиш всичко.
        <span onclick="resendVerify()" style="color:#FF8C00;cursor:pointer;text-decoration:underline;margin-left:6px;">Изпрати отново</span>
      </span>
      <button onclick="this.parentElement.remove();sessionStorage.setItem('verifyBannerDismissed','1')" style="background:none;border:none;color:#6E6A5F;cursor:pointer;font-size:18px;line-height:1;padding:0;flex-shrink:0;">×</button>
    `;
    const main = document.querySelector('main');
    if (main) main.insertBefore(banner, main.firstChild);
  } catch {}
})();

async function resendVerify() {
  const token = localStorage.getItem('userToken');
  if (!token) return;
  try {
    await fetch('https://sofiabuzz.com/api/users/resend-verification', {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    });
    const b = document.getElementById('verify-banner');
    if (b) b.innerHTML = '<span style="font-family:\'Cormorant Garamond\',serif;font-size:14px;color:#FF8C00;padding:0 14px;">✓ Линкът е изпратен! Провери имейла си.</span>';
  } catch {}
}
