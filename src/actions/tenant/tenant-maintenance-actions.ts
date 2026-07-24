/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Kunin ang mga maintenance tickets ng tenant mula sa database
export async function getTenantMaintenanceTickets() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, tickets: [], error: "Walang active session." };
    }

    // Hanapin ang tenant profile gamit ang userId
    const tenant = await prisma.tenant.findUnique({
      where: { id: userId },
      include: {
        leases: {
          where: { status: "active" },
          take: 1,
          include: { room: true }
        }
      }
    });

    if (!tenant) {
      return { success: false, tickets: [], error: "Hindi mahanap ang tenant profile." };
    }

    const dbTickets = await prisma.maintenanceRequest.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      include: {
        room: {
          select: { roomNumber: true }
        }
      }
    });

    // I-map patungong frontend format
    const tickets = dbTickets.map((t) => {
      // I-format ang status para sa badge ng UI
      let status: "Pending" | "In Progress" | "Resolved" | "Rejected" = "Pending";
      if (t.status === "in_progress") status = "In Progress";
      else if (t.status === "resolved") status = "Resolved";
      else if (t.status === "rejected") status = "Rejected";

      // I-format ang oras/petsa kung kailan ginawa
      const timeAgo = new Intl.DateTimeFormat('fil-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(t.createdAt));

      return {
        id: t.ticketNumber || t.id.slice(0, 8).toUpperCase(),
        title: t.title,
        category: t.category,
        description: t.description,
        priority: t.priority,
        status,
        createdAt: timeAgo,
        photoUrl: t.photoUrl || undefined,
        adminRemark: t.adminRemark || undefined,
      };
    });

    return { success: true, tickets, roomId: tenant.leases[0]?.roomId };
  } catch (error) {
    console.error("Error fetching maintenance tickets:", error);
    return { success: false, tickets: [], error: "Nabigong kunin ang mga maintenance tickets." };
  }
}

// Server action para mag-submit ng bagong maintenance ticket
export async function createMaintenanceTicketAction(data: {
  title: string;
  category: any;
  description: string;
  priority: any;
  photoUrl?: string;
}) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, error: "Walang active session." };
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: userId },
      include: {
        leases: {
          where: { status: "active" },
          take: 1,
        }
      }
    });

    if (!tenant || tenant.leases.length === 0) {
      return { success: false, error: "Walang aktibong lease o kwarto para sa tenant na ito." };
    }

    const activeRoomId = tenant.leases[0].roomId;
    const ticketCount = await prisma.maintenanceRequest.count();
    const ticketNumber = `MNT-2026-${String(ticketCount + 1).padStart(3, '0')}`;

    await prisma.maintenanceRequest.create({
      data: {
        ticketNumber,
        roomId: activeRoomId,
        tenantId: tenant.id,
        title: data.title,
        category: data.category,
        description: data.description,
        priority: data.priority,
        status: "pending",
        photoUrl: data.photoUrl,
      },
    });

    revalidatePath("/tenant/maintenance");
    return { success: true };
  } catch (error) {
    console.error("Error creating maintenance ticket:", error);
    return { success: false, error: "Nabigong ma-isumite ang maintenance report." };
  }
}