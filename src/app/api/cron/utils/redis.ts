// src/app/api/cron/utils/redis.ts
import IORedis from 'ioredis';

// Export a singleton Redis connection for BullMQ queues and workers.
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export default redis;
