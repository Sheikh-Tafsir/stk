const Redis = require('ioredis');
require('dotenv').config();

// Create Redis connection
const RedisConfig = new Redis(process.env.REDIS_URL);


RedisConfig.on('connect', () => console.log('✅ Redis connected'));
RedisConfig.on('ready', () => console.log('⚡ Redis ready to use'));
RedisConfig.on('reconnecting', () => console.log('🔁 Redis reconnecting...'));
RedisConfig.on('error', (err) => console.error('❌ Redis error:', err));
RedisConfig.on('end', () => console.log('🔌 Redis connection closed'));

RedisConfig.getAsync = async (key) => {
    return await RedisConfig.get(key);
};

RedisConfig.setAsync = async (key, value) => {
    return await RedisConfig.set(key, value);
};

// Close Redis connection when the application exits
process.on('exit', () => {
    RedisConfig.quit();
    console.log('Redis connection closed');
});

module.exports = RedisConfig;
