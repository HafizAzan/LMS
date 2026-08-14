const LOCAL_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const parseOrigins = (value = '') =>
  value
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

const getAllowedOrigins = () => {
  const fromEnv = parseOrigins(
    process.env.CLIENT_URL || process.env.FRONTEND_URL || '',
  );

  if (process.env.NODE_ENV === 'production') {
    return fromEnv;
  }

  return [...new Set([...LOCAL_ORIGINS, ...fromEnv])];
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();

    if (!origin) {
      return callback(null, true);
    }

    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error(`Origin ${origin} is not allowed by CORS`);
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = { corsOptions, getAllowedOrigins };
