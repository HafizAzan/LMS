const nodemailer = require('nodemailer');
const Progress = require('../models/Progress');

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

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

const sendInactivityReminders = async () => {
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);

  const stale = await Progress.find({
    overallPercent: { $lt: 100 },
    lastAccessedAt: { $lte: cutoff },
    $or: [
      { lastReminderSentAt: { $exists: false } },
      { lastReminderSentAt: null },
      { lastReminderSentAt: { $lte: cutoff } },
    ],
  })
    .populate('user', 'name email')
    .populate('course', 'title');

  if (!stale.length) {
    return { scanned: 0, sent: 0 };
  }

  if (!isMailConfigured()) {
    console.warn(
      `Reminder job: ${stale.length} inactive enrollment(s) found, but SMTP is not configured.`,
    );
    return { scanned: stale.length, sent: 0 };
  }

  const transporter = createTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')[0]
    .trim();

  let sent = 0;

  for (const progress of stale) {
    const email = progress.user?.email;
    const courseTitle = progress.course?.title;
    if (!email || !courseTitle) {
      continue;
    }

    const courseId = progress.course._id;
    await transporter.sendMail({
      from,
      to: email,
      subject: `Continue learning: ${courseTitle}`,
      text: `Hi ${progress.user.name || 'there'},\n\nYou have not accessed "${courseTitle}" in 7 days. Pick up where you left off:\n${clientUrl}/courses/${courseId}/learn\n\n— LMS`,
      html: `<p>Hi ${progress.user.name || 'there'},</p><p>You have not accessed <strong>${courseTitle}</strong> in 7 days.</p><p><a href="${clientUrl}/courses/${courseId}/learn">Continue learning</a></p><p>— LMS</p>`,
    });

    progress.lastReminderSentAt = new Date();
    await progress.save();
    sent += 1;
  }

  console.log(`Reminder job sent ${sent} email(s).`);
  return { scanned: stale.length, sent };
};

const startReminderJob = () => {
  const run = () => {
    sendInactivityReminders().catch((error) => {
      console.error('Reminder job failed:', error.message);
    });
  };

  setTimeout(run, 30 * 1000);
  setInterval(run, CHECK_INTERVAL_MS);
};

module.exports = { sendInactivityReminders, startReminderJob };
