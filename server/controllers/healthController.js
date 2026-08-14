const mongoose = require('mongoose');

const dbStatus = () => {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
};

exports.getHealth = (req, res) => {
  res.json({
    status: 'ok',
    message: 'LMS API is running',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    db: dbStatus(),
  });
};
