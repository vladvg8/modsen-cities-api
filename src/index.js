const express = require('express');
const Fuse = require('fuse.js');
const cors = require('cors');
require('dotenv').config();
const path = require('node:path');
const fs = require('node:fs');
const cities = require('./cities.json');
const logger = require('./logger');

const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const app = express();
const fuse = new Fuse(cities, {
  keys: ['name'],
  threshold: 0.5,
  includeScore: false,
  useExtendedSearch: true,
});

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`Receive request from ${req.ip}`);
  next();
});

app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }
    const results = fuse.search(query).slice(0, 10).map(result => result.item);
    return res.status(200).json(results);
  } catch (error) {
    logger.error(`Failed to search query: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/log', async (req, res) => {
  const logFilePath = path.join(__dirname, 'logs', 'app.log');
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      logger.error(`Cannot read log file: ${err.message}`);
      return res.status(500).json({ error: 'Cannot read log file' });
    }
    res.json({ logs: data });
  });
});

app.listen(PORT, SERVER_HOST, async () => {
  console.log(`Server is running at https://${SERVER_HOST}:${PORT}`);
});
