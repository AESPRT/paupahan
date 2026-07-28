/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from '@/src/lib/prisma'
import { PlanTier } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/src/actions/audit-actions'
import { apiFetch } from "@/src/lib/api";

export type ActionResponse = {
  success: boolean
  message: string
}

export async function registerLandlord(formData: FormData): Promise<ActionResponse> {
  try {
    const fullName = formData.get('fullName') as string
    const propertyName = formData.get('propertyName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string
    const referenceNumber = formData.get('referenceNumber') as string
    const selectedPlanParam = formData.get('plan') as string

    if (!fullName || !email || !password) {
      return { success: false, message: 'Punan ang lahat ng kinakailangang impormasyon.' }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, message: 'Mayroon nang account na nakarehistro gamit ang email na ito.' }
    }

    // I-hash ang password
    const passwordHash = await bcrypt.hash(password, 10)

    // 1. Alamin ang plan tier at billing cycle gamit ang apiFetch kung may referenceNumber
    let planTierStr = selectedPlanParam || 'panimula'
    let billingCycle = 'MONTHLY'

    if (referenceNumber) {
      try {
        // Token para sa API authentication
        const apiToken = process.env.NEXT_PUBLIC_API_SECRET_TOKEN;

        // Pagtawag gamit ang apiFetch (ginagamit ang 'query' param para sa query parameters)
        const response: any = await apiFetch("/v1/paupahan-payments/user-subscription", {
          method: "GET",
          query: { referenceNumber },
          token: apiToken,
        });

        if (response && response.hasActiveSub && response.subscription) {
          const sub = response.subscription;
          planTierStr = sub.package_id || sub.planTier || 'panimula';
          billingCycle = sub.billing_cycle || 'MONTHLY';
        }
      } catch (apiError: any) {
        console.error('Error fetching subscription from API server via apiFetch:', apiError.message || apiError);
      }
    }

    // Siguraduhing valid ang PlanTier batay sa enum
    const validPlanTiers = ['panimula', 'bahay_upa', 'maalam', 'negosyante', 'custom'];
    const planTier: PlanTier = (validPlanTiers.includes(planTierStr) ? planTierStr : 'panimula') as PlanTier;

    // 2. I-map ang mga limitasyon batay sa iyong PLANS config
    let maxUnitsLimit = 1;
    let maxRoomLimit = 3;

    if (planTier === 'bahay_upa') {
      maxUnitsLimit = 3;
      maxRoomLimit = 10;
    } else if (planTier === 'maalam') {
      maxUnitsLimit = 10;
      maxRoomLimit = 30;
    } else if (planTier === 'negosyante') {
      maxUnitsLimit = 30;
      maxRoomLimit = 100;
    } else if (planTier === 'custom') {
      maxUnitsLimit = 999999;
      maxRoomLimit = 999999;
    }

    // 3. I-create ang user account sa Prisma database
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        role: 'landlord',
      },
    })

    // 4. I-create ang subscription gamit ang tamang PlanTier at limitasyon
    const durationMonths = billingCycle === 'ANNUAL' ? 12 : (planTier === 'panimula' ? 12 : 1);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    await prisma.subscription.create({
      data: {
        landlordId: newUser.id,
        planTier: planTier,
        status: 'active',
        maxUnitsLimit: maxUnitsLimit,
        maxRoomLimit: maxRoomLimit,
        renewsOn: expiresAt,
      },
    })

    // 5. I-create ang Property kung mayroon
    if (propertyName) {
      await prisma.property.create({
        data: {
          name: propertyName,
          landlordId: newUser.id,
          addressLine: 'Hindi pa naitakda',
          city: 'Hindi pa naitakda',
        },
      })
    }

    // 6. I-record sa Audit Log
    await createAuditLog({
      actorId: newUser.id,
      action: `Nilikha ang bagong Landlord account (Plano: ${planTier}) at property (${propertyName || 'Walang Pangalan'})`,
      entityType: 'AUTH',
      entityId: newUser.id,
      metadata: { email: newUser.email, propertyName, planTier, referenceNumber, actionType: 'REGISTER_LANDLORD' },
    })

    // 7. I-set ang session cookies
    const cookieStore = await cookies()
    
    cookieStore.set('session_user_id', newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    cookieStore.set('user_role', newUser.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    revalidatePath('/admin/dashboard')
    return { success: true, message: 'Matagumpay na nairehistro ang account at na-activate ang plano!' }
  } catch (error) {
    console.error('Error registering admin/landlord:', error)
    return { success: false, message: 'May naganap na error sa server. Subukan muli mamaya.' }
  }
}