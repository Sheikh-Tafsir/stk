const redisClient = require('../config/redisConfig');

const RATE_LIMIT_WINDOW_SECONDS = 60;

// Function to check global rate limit
const checkGlobalRateLimit = async (max_request) => {
  const key = `global-rate-limit`;
  const count = await redisClient.get(key);
  if (count && parseInt(count) >= max_request) {
    return false; // Rate limit exceeded
  }

  return true;
};

// Function to update global rate limit counter
const updateGlobalRateLimit = async () => {
  const key = `global-rate-limit`;
  const expiration = RATE_LIMIT_WINDOW_SECONDS;

  await redisClient.incr(key);
  await redisClient.expire(key, expiration);
};

//Main function
const GlobalRateLimiter = (max_request) => async (req, res, next) => {
  const allowed = await checkGlobalRateLimit(max_request);
  if (!allowed) {
    return res.status(429).json({ message: 'Too many requests, please try again later' });
  }

  await updateGlobalRateLimit();
  next();
};

module.exports = GlobalRateLimiter;
