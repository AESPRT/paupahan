import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { runAutoBillingForLandlord } from '@/src/actions/billings-actions';

export async function GET(request: Request) {
  // 1. Security Check gamit ang Secret Key mula sa .env ng iyong VPS
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Kunin ang lahat ng landlords sa sistema
    const landlords = await prisma.user.findMany({
      where: { role: 'landlord' },
      select: { id: true, email: true }
    });

    let processedCount = 0;
    let skippedCount = 0;

    for (const landlord of landlords) {
      // 3. Suriin ang subscription ng bawat landlord gamit ang database table
      const subscription = await prisma.subscription.findFirst({
        where: { landlordId: landlord.id },
      });

      // Tukuyin ang tier (default sa 'panimula' kung walang active subscription)
      const tier = subscription && subscription.status === 'active' 
        ? subscription.planTier.toLowerCase() 
        : 'panimula';

      // 4. Salain: Payagan lamang ang 'negosyante' (Kompleto) at 'custom' (Eksklusibo)
      if (tier !== 'negosyante' && tier !== 'custom') {
        skippedCount++;
        continue;
      }

      // 5. Patakbuhin ang auto-billing para sa mga kwalipikadong plan
      await runAutoBillingForLandlord(landlord.id);
      processedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Auto-billing executed successfully. Processed (Kompleto/Eksklusibo): ${processedCount}, Skipped: ${skippedCount}.` 
    });
  } catch (error) {
    console.error('VPS Cron job error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}