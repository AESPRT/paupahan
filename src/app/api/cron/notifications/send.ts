// src/app/api/cron/notifications/send.ts
import { apiFetch } from '@/src/lib/api';

interface SendEmailParams {
  to: string;
  tenantName: string;
  subject?: string;
  html?: string;
  totalAmount: number;
  dueDate?: Date | string;
  landlordName?: string;
  invoiceNumber?: string;
  reminderNote?: string;
}

export async function sendEmail({
  to,
  tenantName,
  totalAmount,
  dueDate = new Date(),
  landlordName = 'Landlord',
  invoiceNumber = '',
  reminderNote = '',
}: SendEmailParams) {
  // Inialign ang payload properties sa mga dinedestructure sa sendBillReminder controller:
  // const { tenantName, tenantEmail, landlordName, dueDate, totalAmount, invoiceNumber, reminderNote } = req.body;
  const payload = {
    tenantName,
    tenantEmail: to,
    landlordName,
    dueDate: new Date(dueDate).toLocaleDateString('fil-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    totalAmount,
    invoiceNumber,
    reminderNote,
  };

  const token = process.env.NEXT_PUBLIC_API_SECRET_TOKEN;
  
  // Tiyaking tama ang API endpoint path (e.g., /notify/reminder o /notify/bill-reminder)
  await apiFetch('/notify/reminder', {
    method: 'POST',
    body: payload,
    token,
  });
}

export async function sendSMS(to: string, body: string) {
  const token = process.env.NEXT_PUBLIC_API_SECRET_TOKEN;
  await apiFetch('/notify/sms', {
    method: 'POST',
    body: { phoneNumber: to, message: body },
    token,
  });
}

export async function sendInAppNotification(userId: string, title: string, message: string) {
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