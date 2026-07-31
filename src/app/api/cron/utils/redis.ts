// src/app/api/cron/utils/redis.ts
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Kailangan ng BullMQ ng maxRetriesPerRequest: null
export const redisConnectionOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  connectTimeout: 5000, // 5 seconds timeout para MAG-FAIL agad imbes na mag-hang nang walang katapusan
};

const redis = new Redis(redisUrl, redisConnectionOptions);

redis.on('error', (err) => {
  console.error('🔴 Redis Connection Error:', err);
});

redis.on('connect', () => {
  console.log('🟢 Connected to Redis successfully!');
});

export default redis;