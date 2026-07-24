'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAuditLog } from '@/src/actions/audit-actions'

export async function logoutUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session_user_id')?.value

  // ✨ I-record muna sa log bago burahin ang session habang kilala pa natin ang user
  if (userId) {
    await createAuditLog({
      actorId: userId,
      action: 'Nag-log out ang administrator sa system',
      entityType: 'AUTH',
      entityId: userId,
      metadata: { actionType: 'LOGOUT' },
    })
  }
  
  // Burahin ang mga cookies na ginagamit sa sesyon pati ang user_role
  cookieStore.delete('session_user_id')
  cookieStore.delete('user_role') // 👈 Burahin din ang user role cookie
  cookieStore.delete('token')
  cookieStore.delete('accessToken')

  redirect('/admin/login')
}

export type LoginResponse = {
  success: boolean
  message: string
}

export async function loginUser(formData: FormData): Promise<LoginResponse> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { success: false, message: 'Punan ang email at password.' }
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // ✨ I-record ang failed login attempt (hindi natagpuan ang email)
      await createAuditLog({
        action: `Nabigong pag-login: Hindi natagpuan ang email (${email})`,
        entityType: 'AUTH',
        entityId: email,
        metadata: { attemptedEmail: email, reason: 'USER_NOT_FOUND' },
      })

      return { success: false, message: 'Maling email o password. Pakisubukan ulit.' }
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      // ✨ I-record ang failed login attempt (maling password)
      await createAuditLog({
        actorId: user.id,
        action: 'Nabigong pag-login: Maling password',
        entityType: 'AUTH',
        entityId: user.id,
        metadata: { email: user.email, reason: 'INVALID_PASSWORD' },
      })

      return { success: false, message: 'Maling email o password. Pakisubukan ulit.' }
    }

    // Itakda ang session cookies sa server
    const cookieStore = await cookies()
    
    // 1. Session User ID cookie
    cookieStore.set('session_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 linggo
    })

    // 2. User Role cookie para sa Proxy/Middleware validation
    cookieStore.set('user_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 linggo
    })

    // ✨ I-record ang matagumpay na pag-login
    await createAuditLog({
      actorId: user.id,
      action: 'Matagumpay na nag-login ang administrator',
      entityType: 'AUTH',
      entityId: user.id,
      metadata: { email: user.email, actionType: 'LOGIN_SUCCESS' },
    })

    revalidatePath('/admin/dashboard/home')
    return { success: true, message: 'Matagumpay na nakapag-login!' }
  } catch (error) {
    console.error('Error logging in:', error)
    return { success: false, message: 'May naganap na error sa server. Subukan muli mamaya.' }
  }
}