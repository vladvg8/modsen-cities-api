const winston = require('winston');
const path = require('node:path');

const logDir = path.join(__dirname, 'logs');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'app.log') })
  ]
});

module.exports = logger;