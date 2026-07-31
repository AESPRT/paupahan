/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/cron/workers/notificationWorker.ts
import { Worker, Job } from 'bullmq';
import { redisConnectionOptions } from '@/src/app/api/cron/utils/redis';
import { sendEmail, sendSMS, sendInAppNotification } from '@/src/app/api/cron/notifications/send';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  ...redisConnectionOptions,
};

const notificationWorker = new Worker(
  'notifications',
  async (job: Job) => {
    const { userId, billId, dueDate, amount } = job.data as any;

    const prisma = (await import('@/src/lib/prisma')).default;

    // Isinama ang `userId` (mismong User Table Foreign Key ng Tenant)
    const tenant = await prisma.tenant.findUnique({
      where: { id: userId },
      select: { 
        userId: true, // 👈 Kinuha ang totoong User Account ID
        email: true, 
        phone: true, 
        fullName: true,
        user: {
          select: {
            fullName: true,
          }
        }
      },
    });

    if (!tenant) {
      console.warn(`Tenant ${userId} not found for notification job ${job.id}`);
      return;
    }

    const subject = job.name === 'bill_due_reminder' ? 'Upcoming Rent Due' : 'Bill Overdue';
    const title = subject;
    const formattedAmount = Number(amount) || 0;
    const formattedDate = new Date(dueDate).toLocaleDateString('fil-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const landlordName = tenant.user?.fullName || 'Landlord';

    const message = `${tenant.fullName}, your bill (ID: ${billId}) of amount ₱${formattedAmount} is ${
      job.name === 'bill_due_reminder' ? 'due on' : 'overdue since'
    } ${formattedDate}. Please settle it promptly.`;

    // 📧 1. Send Email (Matagumpay na gumagana)
    if (tenant.email) {
      await sendEmail({
        to: tenant.email,
        tenantName: tenant.fullName,
        landlordName,
        totalAmount: formattedAmount,
        dueDate,
        invoiceNumber: billId,
        reminderNote: message,
      });
    }

    // 📱 2. Send SMS
    if (tenant.phone) {
      await sendSMS(tenant.phone, message);
    }

    // 🔔 3. In-App Notification (Inayos: Ginamit ang `tenant.userId` sa halip na Tenant ID)
    const targetUserId = tenant.userId || userId;
    await sendInAppNotification(targetUserId, title, message);
  },
  {
    connection,
  }
);

notificationWorker.on('completed', (job) => {
  console.log(`✅ Notification job ${job.id} (${job.name}) completed successfully.`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`🔴 Notification job ${job?.id} failed:`, err.message);
});

export default notificationWorker;