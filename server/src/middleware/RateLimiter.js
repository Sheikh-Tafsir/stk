const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 10,
  delayMs: () => 500 // always adds 500ms delay after 10 requests
});

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: 'Too many requests, try again later.'
});

module.exports = { speedLimiter, rateLimiter };
