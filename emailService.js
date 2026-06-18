const { Resend } = require('resend');
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendEmail(to, subject, html) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — skipping send to ${to}: ${subject}`);
    return false;
  }
  try {
    await resend.emails.send({
      from: 'SofiaBuzz <noreply@sofiabuzz.com>',
      to,
      subject,
      html
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

module.exports = { sendEmail };
