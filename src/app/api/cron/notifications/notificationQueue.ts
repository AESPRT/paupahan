// src/app/api/cron/notifications/notificationQueue.ts
import { Queue } from 'bullmq';
import { redisConnectionOptions } from '@/src/app/api/cron/utils/redis';

export const notificationQueue = new Queue('notifications', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    ...redisConnectionOptions,
  },
  defaultJobOptions: {
    removeOnComplete: true, // Awtomatikong buburahin pag success
    removeOnFail: true,     // Awtomatikong buburahin kapag nag-fail para pwedeng i-retry
  },
});