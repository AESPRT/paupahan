// src/app/api/cron/notifications/notificationQueue.ts
import { Queue } from 'bullmq';
import redis from '../utils/redis';

// Queue for notification jobs (email/SMS/in-app)
export const notificationQueue = new Queue('notifications', {
  connection: redis,
});
