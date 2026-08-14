const { sendMail } = require('./mail');

const sendOtpEmail = async ({ to, name, otp, purpose }) => {
  const isReset = purpose === 'reset';
  const subject = isReset ? 'Reset your LearnHub password' : 'Verify your LearnHub email';
  const intro = isReset
    ? 'Use this code to reset your password. It expires in 1 minute.'
    : 'Use this code to verify your email. It expires in 1 minute.';

  const text = `Hi ${name || 'there'},\n\n${intro}\n\nYour code: ${otp}\n\nIf you did not request this, you can ignore this email.\n\n— LearnHub`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;color:#121c28">
      <h2 style="color:#4343d5;margin-bottom:8px">LearnHub</h2>
      <p>Hi ${name || 'there'},</p>
      <p>${intro}</p>
      <p style="font-size:32px;letter-spacing:8px;font-weight:700;background:#e1e0ff;padding:16px 24px;border-radius:12px;text-align:center">${otp}</p>
      <p style="color:#464555;font-size:14px">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await sendMail({ to, subject, text, html });
};

module.exports = { sendOtpEmail };
