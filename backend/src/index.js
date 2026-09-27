require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const surveyRoutes = require('./routes/survey');
const issuesRoutes = require('./routes/issues');
const suggestionsRoutes = require('./routes/suggestions');
const candidateRoutes = require('./routes/candidate');
const updatesRoutes = require('./routes/updates');
const adminRoutes = require('./routes/admin');
const referenceRoutes = require('./routes/reference');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// CORS: only the two known frontends may call this API.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// General rate limiting on public write endpoints to deter abuse.
const publicWriteLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
app.use(['/api/survey', '/api/issues', '/api/suggestions'], publicWriteLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/survey', surveyRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/updates', updatesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reference', referenceRoutes);

// Never leak stack traces / internals to the client.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Kelu backend listening on :${PORT}`));
