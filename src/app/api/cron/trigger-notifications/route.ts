// src/app/api/cron/trigger-notifications/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { enqueueOverdueNotifications } from '@/src/app/api/cron/jobs/overdueCheck';

/**
 * Manual trigger for the notification system.
 * Only landlords whose subscription tier is "negosyante" or "custom"
 * (same rule as the auto‑billing cron) will have their tenants
 * receive reminder / overdue notifications.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find all landlords
    const landlords = await prisma.user.findMany({
      where: { role: 'landlord' },
      select: { id: true },
    });

    const allowedLandlordIds: string[] = [];

    // Filter by subscription tier (negosyante or custom)
    for (const landlord of landlords) {
      const subscription = await prisma.subscription.findFirst({
        where: { landlordId: landlord.id },
      });

      const tier = subscription && subscription.status === 'active'
        ? subscription.planTier.toLowerCase()
        : 'panimula';

      if (tier === 'negosyante' || tier === 'custom') {
        allowedLandlordIds.push(landlord.id);
      }
    }

    // Enqueue notifications only for allowed landlords
    await enqueueOverdueNotifications(allowedLandlordIds.length ? allowedLandlordIds : undefined);
    return NextResponse.json({ success: true, message: 'Notification jobs enqueued' });
  } catch (error) {
    console.error('Trigger notifications error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
