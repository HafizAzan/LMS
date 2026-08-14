const nodemailer = require('nodemailer');

const isMailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransport = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendMail = async ({ to, subject, text, html }) => {
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email is not configured');
    }
    console.warn(`[mail] SMTP not configured. Skipping send to ${to}: ${subject}\n${text}`);
    return { skipped: true };
  }

  const transporter = createTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await transporter.sendMail({ from, to, subject, text, html });
  return { skipped: false };
};

module.exports = { isMailConfigured, sendMail };
