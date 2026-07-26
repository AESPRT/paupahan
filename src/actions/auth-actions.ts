'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAuditLog } from '@/src/actions/audit-actions'

// --- RATE LIMITER CONFIGURATION (In-Memory) ---
const loginAttempts = new Map<string, { count: number; lockoutUntil: number }>()

// Linisin ang lumang entries bawat oras para hindi maubusan ng memory ang server
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of loginAttempts.entries()) {
    if (now > value.lockoutUntil) {
      loginAttempts.delete(key)
    }
  }
}, 60 * 60 * 1000)

const MAX_ATTEMPTS = 5 // Pinakamaraming maling subok
const LOCKOUT_TIME_MS = 15 * 60 * 1000 // 15 minuto na bawal mag-login

export async function logoutUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session_user_id')?.value

  if (userId) {
    await createAuditLog({
      actorId: userId,
      action: 'Nag-log out ang administrator sa system',
      entityType: 'AUTH',
      entityId: userId,
      metadata: { actionType: 'LOGOUT' },
    })
  }
  
  cookieStore.delete('session_user_id')
  cookieStore.delete('user_role')
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

    // Kunin ang IP address ng humihiling para sa rate limiting identifier
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown-ip'
    const rateLimitKey = `${ipAddress}_${email.toLowerCase().trim()}`

    const now = Date.now()
    const currentAttempt = loginAttempts.get(rateLimitKey)

    // Suriin kung naka-lockout ang IP/Email dahil sa sunud-sunod na sablay
    if (currentAttempt && currentAttempt.count >= MAX_ATTEMPTS) {
      if (now < currentAttempt.lockoutUntil) {
        const remainingMinutes = Math.ceil((currentAttempt.lockoutUntil - now) / (60 * 1000))
        
        await createAuditLog({
          action: `Na-block ang pag-login dahil sa Rate Limit: ${email}`,
          entityType: 'AUTH',
          entityId: email,
          metadata: { email, ipAddress, reason: 'RATE_LIMIT_EXCEEDED' },
        })

        return { 
          success: false, 
          message: `T Sobrang dami ng maling pagsubok. Subukan muli pagkatapos ng ${remainingMinutes} minuto.` 
        }
      } else {
        // Lumipas na ang lockout time, i-reset
        loginAttempts.delete(rateLimitKey)
      }
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Mag-record ng failed attempt sa rate limiter
      trackFailedAttempt(rateLimitKey, now)

      await createAuditLog({
        action: `Nabigong pag-login: Hindi natagpuan ang email (${email})`,
        entityType: 'AUTH',
        entityId: email,
        metadata: { attemptedEmail: email, ipAddress, reason: 'USER_NOT_FOUND' },
      })

      return { success: false, message: 'Maling email o password. Pakisubukan ulit.' }
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      // Mag-record ng failed attempt sa rate limiter
      trackFailedAttempt(rateLimitKey, now)

      await createAuditLog({
        actorId: user.id,
        action: 'Nabigong pag-login: Maling password',
        entityType: 'AUTH',
        entityId: user.id,
        metadata: { email: user.email, ipAddress, reason: 'INVALID_PASSWORD' },
      })

      return { success: false, message: 'Maling email o password. Pakisubukan ulit.' }
    }

    // Kung nagtagumpay, i-clear ang record sa rate limiter para malinis
    loginAttempts.delete(rateLimitKey)

    // Itakda ang session cookies sa server
    const cookieStore = await cookies()
    
    cookieStore.set('session_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    cookieStore.set('user_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

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

// Helper function para magdagdag ng bilang sa mga nabigong pagsubok
function trackFailedAttempt(key: string, now: number) {
  const existing = loginAttempts.get(key)
  if (!existing) {
    loginAttempts.set(key, { count: 1, lockoutUntil: now + LOCKOUT_TIME_MS })
  } else {
    existing.count += 1
    existing.lockoutUntil = now + LOCKOUT_TIME_MS // I-reset ang timer kada sablay
    loginAttempts.set(key, existing)
  }
}