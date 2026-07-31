// src/app/api/cron/jobs/overdueCheck.ts
import prisma from '@/src/lib/prisma';
import { notificationQueue } from '@/src/app/api/cron/notifications/notificationQueue';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { BillStatus } from '@prisma/client';

export async function enqueueOverdueNotifications(allowedLandlordIds?: string[]) {
  console.log('\n==================================================');
  console.log('🚀 [CRON] Starting enqueueOverdueNotifications...');
  console.log('==================================================');

  const today = new Date();
  const startOfToday = startOfDay(today);
  const todayStr = startOfToday.toISOString().split('T')[0];

  console.log(`📅 Current Date: ${today.toISOString()}`);
  console.log(`🔑 Allowed Landlord IDs Filter:`, allowedLandlordIds || 'None (All Landlords)');

  const landlordFilter = allowedLandlordIds
    ? { tenant: { userId: { in: allowedLandlordIds } } }
    : {};

  // -------------------------------------------------------------
  // 1️⃣ Upcoming due reminders
  // -------------------------------------------------------------
  const oneWeekAheadStart = startOfDay(addDays(today, 7));
  const oneWeekAheadEnd = endOfDay(addDays(today, 7));

  console.log(`\n🔍 [1/2] Checking Upcoming Due Bills...`);

  const upcomingBills = await prisma.bill.findMany({
    where: {
      dueDate: {
        gte: oneWeekAheadStart,
        lte: oneWeekAheadEnd,
      },
      status: { in: [BillStatus.pending, BillStatus.overdue, BillStatus.draft] },
      ...landlordFilter,
    },
    select: {
      id: true,
      tenantId: true,
      dueDate: true,
      totalAmount: true,
    },
  });

  console.log(`📊 Found ${upcomingBills.length} upcoming bill(s).`);

  if (upcomingBills.length > 0) {
    console.log(`⏳ Enqueueing upcoming bill jobs...`);
    for (const bill of upcomingBills) {
      try {
        await notificationQueue.add(
          'bill_due_reminder',
          {
            userId: bill.tenantId,
            billId: bill.id,
            dueDate: bill.dueDate,
            amount: bill.totalAmount,
          },
          {
            jobId: `due_reminder_${bill.id}_${todayStr}`,
            removeOnComplete: true, // I-clean up ang finished jobs
            removeOnFail: false,
          }
        );
        console.log(`  └─ 🟢 Enqueued upcoming job for Bill ID: ${bill.id}`);
      } catch (err) {
        console.error(`  └─ 🔴 Failed to enqueue upcoming job for Bill ID: ${bill.id}`, err);
      }
    }
  }

  // -------------------------------------------------------------
  // 2️⃣ Daily Overdue Notifications
  // -------------------------------------------------------------
  console.log(`\n🔍 [2/2] Checking Overdue Bills (Due before: ${startOfToday.toISOString()})...`);

  const overdueBills = await prisma.bill.findMany({
    where: {
      dueDate: { lt: startOfToday },
      status: { in: [BillStatus.pending, BillStatus.overdue, BillStatus.draft] },
      ...landlordFilter,
    },
    select: {
      id: true,
      tenantId: true,
      dueDate: true,
      totalAmount: true,
    },
  });

  console.log(`📊 Found ${overdueBills.length} overdue bill(s).`);

  if (overdueBills.length > 0) {
    const overdueIds = overdueBills.map((b) => b.id);

    console.log(`📝 Updating status to OVERDUE in Database...`);
    const updateResult = await prisma.bill.updateMany({
      where: { id: { in: overdueIds } },
      data: { status: BillStatus.overdue },
    });
    console.log(`✅ Updated ${updateResult.count} record(s) in Database.`);

    console.log(`⏳ Enqueueing overdue notification jobs to BullMQ...`);
    
    // Ginamitan ng loop na may try-catch bawat isa para hindi ma-stuck ang buong request
    for (const bill of overdueBills) {
      try {
        console.log(`  └─ Attempting to add job for Bill ID: ${bill.id}...`);
        await notificationQueue.add(
          'bill_overdue_daily',
          {
            userId: bill.tenantId,
            billId: bill.id,
            dueDate: bill.dueDate,
            amount: bill.totalAmount,
          },
          {
            jobId: `daily_overdue_${bill.id}_${todayStr}`,
            removeOnComplete: true,
            removeOnFail: false,
          }
        );
        console.log(`  └─ 🟢 Successfully enqueued job for Bill ID: ${bill.id}`);
      } catch (err) {
        console.error(`  └─ 🔴 Queue Add Error on Bill ID: ${bill.id}`, err);
      }
    }
  }

  console.log('\n==================================================');
  console.log('🎉 [CRON] Completed enqueueOverdueNotifications!');
  console.log('==================================================\n');
}