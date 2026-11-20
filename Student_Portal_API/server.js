require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const authRouter = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');
const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(helmet());
app.use(cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use(express.json({ limit: '100kb' }));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.use('/', authRouter);
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);
async function start() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in .env.');
  if (!process.env.JWT_SECRET) throw new Error('Set JWT_SECRET in .env.');
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
start().catch((error) => { console.error('Startup failed:', error.message); process.exit(1); });
