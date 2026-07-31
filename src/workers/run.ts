// src/workers/run.ts
import 'dotenv/config'; // I-load ang mga environment variables mula sa .env
import notificationWorker from '@/src/app/api/cron/workers/notificationWorker';

console.log('🚀 Notification Worker started and listening for jobs...');

// Graceful shutdown handlers para kapag pinalo ng Ctrl+C sa terminal
const shutdown = async () => {
  console.log('\n🛑 Shutting down Notification Worker...');
  await notificationWorker.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);