const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
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
