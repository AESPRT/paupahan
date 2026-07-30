// src/app/api/cron/notifications/send.ts
// Use existing API endpoints for email notifications
import { apiFetch } from '@/src/lib/api';
// Placeholder for SMS (e.g., Twilio) – left as stub
// In production replace with actual providers.

export async function sendEmail(to: string, subject: string, html: string) {
  // Reuse the existing backend notification endpoint for email delivery.
  // The endpoint expects a rich payload; we'll provide the minimal fields required.
  const payload = {
    tenantName: '', // Not available in this context
    tenantEmail: to,
    landlordName: '',
    dueDate: new Date().toISOString(),
    totalAmount: 0,
    invoiceNumber: '',
    billItems: [],
    subject,
    html,
  };

  const token = process.env.NEXT_PUBLIC_API_SECRET_TOKEN;
  await apiFetch('/notify/bill', {
    method: 'POST',
    body: payload,
    token,
  });
}

export async function sendSMS(to: string, body: string) {
  // Forward SMS via the existing backend notification endpoint.
  const token = process.env.NEXT_PUBLIC_API_SECRET_TOKEN;
  await apiFetch('/notify/sms', {
    method: 'POST',
    body: { phoneNumber: to, message: body },
    token,
  });
}

export async function sendInAppNotification(userId: string, title: string, message: string) {
  // Insert into notifications table via Prisma (in‑app UI reads this table).
  const prisma = (await import('@/src/lib/prisma')).default;
  await prisma.notification.create({
    data: {
      recipientUserId: userId,
      type: title,
      channel: 'in_app',
      title,
      message,
      status: 'pending',
    },
  });
}
