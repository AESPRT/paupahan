/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from '@/src/lib/prisma'

/**
 * Tumutulong mag-record ng bagong aktibidad sa database.
 */
export async function createAuditLog({
  actorId,
  action,
  entityType,
  entityId,
  metadata = {},
}: {
  actorId?: string
  action: string
  entityType: string
  entityId: string
  metadata?: Record<string, any>
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata,
      },
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
  }
}

/**
 * Kumukuha ng mga huling aktibidad ng isang user para sa Profile Page.
 */
export async function getUserAuditLogs(userId: string) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return logs.map((log) => {
      const timeAgo = new Intl.DateTimeFormat('fil-PH', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(new Date(log.createdAt))

      return {
        id: log.id,
        action: log.action,
        timestamp: timeAgo,
        category: log.entityType === 'AUTH' ? ('Security' as const) : ('Tenant' as const),
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
}