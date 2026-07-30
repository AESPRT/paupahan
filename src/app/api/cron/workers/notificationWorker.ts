// src/app/api/cron/workers/notificationWorker.ts
import { Worker, Job } from 'bullmq';
import redis from '@/src/app/api/cron/utils/redis';
import { sendEmail, sendSMS, sendInAppNotification } from '@/src/app/api/cron/notifications/send';

// Process notification jobs.
const notificationWorker = new Worker('notifications', async (job: Job) => {
  const { userId, billId, dueDate, amount } = job.data as any;
  // Fetch tenant contact info (email/phone) – quick lookup via Prisma.
  const prisma = (await import('@/src/lib/prisma')).default;
  const tenant = await prisma.tenant.findUnique({
    where: { id: userId },
    select: { email: true, phone: true, fullName: true },
  });

  if (!tenant) {
    console.warn(`Tenant ${userId} not found for notification job ${job.id}`);
    return;
  }

  const subject = job.name === 'bill_due_reminder' ? 'Upcoming Rent Due' : 'Bill Overdue';
  const title = subject;
  const message = `${tenant.fullName}, your bill (ID: ${billId}) of amount $${amount} is ${job.name === 'bill_due_reminder' ? 'due on' : 'overdue since'
    } ${new Date(dueDate).toLocaleDateString()}. Please settle it promptly.`;

  // Email
  if (tenant.email) {
    await sendEmail(tenant.email, subject, `<p>${message}</p>`);
  }

  // SMS – optional stub
  if (tenant.phone) {
    await sendSMS(tenant.phone, message);
  }

  // In‑app notification
  await sendInAppNotification(userId, title, message);
}, {
  connection: redis,
});

notificationWorker.on('completed', (job) => {
  console.log(`Notification job ${job.id} (${job.name}) completed.`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`Notification job ${job?.id} failed:`, err);
});

export default notificationWorker;
