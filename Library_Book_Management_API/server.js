require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const booksRouter = require('./routes/books');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100kb' }));
app.use(requestLogger);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.use('/books', booksRouter);
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

async function start() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in .env.');
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`Library API listening at http://localhost:${PORT}`));
}
start().catch((error) => {
  console.error('Startup failed:', error.message);
  process.exit(1);
});
