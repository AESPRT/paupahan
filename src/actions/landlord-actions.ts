'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/src/actions/audit-actions' // 👈 I-import ang createAuditLog

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

    // 1. I-create ang user account
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        role: 'landlord',
      },
    })

    // 2. Awtomatikong bigyan ng libreng default subscription
    await prisma.subscription.create({
      data: {
        landlordId: newUser.id,
        planTier: 'panimula',
        status: 'active',
        maxUnitsLimit: 5,
      },
    })

    // 3. I-create ang Property kung mayroon
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

    // ✨ 4. I-record sa Audit Log ang pagrerehistro ng bagong landlord account
    await createAuditLog({
      actorId: newUser.id,
      action: `Nilikha ang bagong Landlord account at property (${propertyName || 'Walang Pangalan'})`,
      entityType: 'AUTH',
      entityId: newUser.id,
      metadata: { email: newUser.email, propertyName, actionType: 'REGISTER_LANDLORD' },
    })

    // 5. Gumawa ng sesyon / i-set ang cookie para awtomatikong maging logged-in
    const cookieStore = await cookies()
    cookieStore.set('session_user_id', newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 linggo
    })

    revalidatePath('/admin/dashboard')
    return { success: true, message: 'Matagumpay na nairehistro ang account!' }
  } catch (error) {
    console.error('Error registering admin/landlord:', error)
    return { success: false, message: 'May naganap na error sa server. Subukan muli mamaya.' }
  }
}