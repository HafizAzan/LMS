require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { corsOptions, getAllowedOrigins } = require('./config/cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { handleStripeWebhook } = require('./controllers/paymentController');
const { startReminderJob } = require('./jobs/reminderJob');
const routes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const quizRoutes = require('./routes/quizRoutes');
const progressRoutes = require('./routes/progressRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(cookieParser());
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const Review = require('./models/Review');
    await Review.syncIndexes();
    app.listen(PORT, '0.0.0.0', () => {
      const origins = getAllowedOrigins();
      console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`,
      );
      if (!origins.length) {
        console.warn(
          'CLIENT_URL is not set. Browser requests from the deployed frontend will be blocked by CORS.',
        );
      } else {
        console.log(`CORS allowed origins: ${origins.join(', ')}`);
      }
      startReminderJob();
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

startServer();
