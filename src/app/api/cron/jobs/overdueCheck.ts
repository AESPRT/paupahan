// src/app/api/cron/jobs/overdueCheck.ts
import prisma from '@/src/lib/prisma';
import { notificationQueue } from '@/src/app/api/cron/notifications/notificationQueue';
import { addDays } from 'date-fns';
import { BillStatus } from '@prisma/client';

/**
 * Enqueue notification jobs for bills that are due soon (1 week before) and for overdue bills.
 */
export async function enqueueOverdueNotifications(allowedLandlordIds?: string[]) {
  const today = new Date();
  const oneWeekAhead = addDays(today, 7);

  // 1️⃣ Upcoming due reminders (1 week before due date)
  const upcomingBills = await prisma.bill.findMany({
    where: {
      dueDate: oneWeekAhead,
      status: { in: [BillStatus.pending, BillStatus.overdue] },
      // If landlord filter is provided, ensure the tenant belongs to one of those landlords
      ...(allowedLandlordIds ? { tenant: { userId: { in: allowedLandlordIds } } } : {}),
    },
    select: {
      id: true,
      tenantId: true,
      dueDate: true,
      totalAmount: true,
    },
  });

  for (const bill of upcomingBills) {
    await notificationQueue.add('bill_due_reminder', {
      userId: bill.tenantId,
      billId: bill.id,
      dueDate: bill.dueDate,
      amount: bill.totalAmount,
    });
  }

  // 2️⃣ Overdue reminders (any bill past due date that is not paid)
  const overdueBills = await prisma.bill.findMany({
    where: {
      dueDate: { lt: today },
      status: { in: [BillStatus.pending, BillStatus.overdue] },
      ...(allowedLandlordIds ? { tenant: { userId: { in: allowedLandlordIds } } } : {}),
    },
    select: {
      id: true,
      tenantId: true,
      dueDate: true,
      totalAmount: true,
    },
  });

  for (const bill of overdueBills) {
    await notificationQueue.add('bill_overdue', {
      userId: bill.tenantId,
      billId: bill.id,
      dueDate: bill.dueDate,
      amount: bill.totalAmount,
    });
  }
}
