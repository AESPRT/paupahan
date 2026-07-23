'use server'

import prisma from '@/src/lib/prisma'
import { cookies } from 'next/headers'

export async function getDashboardData() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('session_user_id')?.value

    // 1. Kunin ang impormasyon ng kasalukuyang nag-login na admin/landlord
    let adminName = 'Admin'
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true },
      })
      if (user) {
        adminName = user.fullName
      }
    }

    // 2. Kunin ang kabuuang stats mula sa Database
    const totalProperties = await prisma.property.count()
    const totalUnits = await prisma.unit.count()
    const totalRooms = await prisma.room.count()
    const occupiedRooms = await prisma.room.count({
      where: { status: 'occupied' },
    })
    const vacantRooms = await prisma.room.count({
      where: { status: 'vacant' },
    })
    
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

    // Pag-compute ng buwanang kita (Paid bills)
    const paidBills = await prisma.bill.aggregate({
      where: { status: 'paid' },
      _sum: { totalAmount: true },
    })
    const monthlyRevenue = Number(paidBills._sum.totalAmount || 0)

    // Pending bills amount
    const pendingBills = await prisma.bill.aggregate({
      where: { status: 'pending' },
      _sum: { totalAmount: true },
    })
    const pendingBillsAmount = Number(pendingBills._sum.totalAmount || 0)

    // 3. Buuin ang Chart Data para sa nakalipas na 6 na buwan
    const months = ["Ene", "Peb", "Mar", "Abr", "May", "Hun", "Hul", "Ago", "Set", "Okt", "Nob", "Dis"];
    const currentDate = new Date();
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      
      const startDate = new Date(`${year}-${monthStr}-01`);
      const endDate = new Date(year, d.getMonth() + 1, 0, 23, 59, 59);

      const monthlyTotal = await prisma.bill.aggregate({
        where: {
          status: 'paid',
          paidAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: { totalAmount: true },
      });

      const amountNum = Number(monthlyTotal._sum.totalAmount || 0);
      
      const formattedAmount = amountNum >= 1000 
        ? `₱${(amountNum / 1000).toFixed(1)}k` 
        : `₱${amountNum}`;

      chartData.push({
        month: monthName,
        val: amountNum,
        amount: formattedAmount,
      });
    }

    // 4. Kunin at i-map ang mga pending na bills/readings para sa Approvals
    const rawPendingBills = await prisma.bill.findMany({
      where: { status: 'pending' },
      orderBy: { generatedAt: 'desc' },
      take: 5,
      include: {
        tenant: {
          select: {
            fullName: true,
            leases: {
              where: { status: 'active' },
              include: {
                room: {
                  select: {
                    roomNumber: true,
                    unit: { select: { name: true } },
                  },
                },
              },
              take: 1,
            },
          },
        },
        items: {
          select: { type: true },
        },
      },
    })

    const pendingReadings = rawPendingBills.map((bill) => {
      const tenantName = bill.tenant?.fullName || 'Unknown Tenant';
      
      const activeLease = bill.tenant?.leases?.[0];
      const roomNum = activeLease?.room?.roomNumber || '';
      const unitName = activeLease?.room?.unit?.name || '';
      const unitLabel = unitName && roomNum ? `${unitName} - Room ${roomNum}` : (roomNum ? `Room ${roomNum}` : (unitName || 'General'));

      const timeAgo = new Intl.DateTimeFormat('fil-PH', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(new Date(bill.generatedAt));

      let type: "water" | "electricity" | "rent" | "amenities" = "rent";
      const itemType = bill.items?.[0]?.type?.toLowerCase() || '';
      if (itemType.includes('water')) type = "water";
      else if (itemType.includes('electric')) type = "electricity";
      else if (itemType.includes('amenit') || itemType.includes('parking')) type = "amenities";

      const amountFormatted = new Intl.NumberFormat('fil-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(Number(bill.totalAmount));

      return {
        id: bill.id,
        tenantName,
        unitName: unitLabel,
        type,
        readingOrAmount: amountFormatted,
        dateSubmitted: timeAgo,
      };
    });

    // 5. Kunin ang huling mga notifications/activities para sa RecentActivities
    const rawNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const recentActivities = rawNotifications.map((notif) => {
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - new Date(notif.createdAt).getTime()) / (1000 * 60));
      
      let timeStr = `${diffInMinutes} mins ago`;
      if (diffInMinutes >= 60 && diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        timeStr = `${hours} hr${hours > 1 ? 's' : ''} ago`;
      } else if (diffInMinutes >= 1440) {
        const days = Math.floor(diffInMinutes / 1440);
        timeStr = `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (diffInMinutes < 1) {
        timeStr = 'Just now';
      }

      let type: "payment" | "tenant" | "maintenance" = "tenant";
      const notifType = notif.type.toLowerCase();
      if (notifType.includes('payment') || notifType.includes('bayad') || notifType.includes('bill')) {
        type = "payment";
      } else if (notifType.includes('maintenance') || notifType.includes('repair') || notifType.includes('sira')) {
        type = "maintenance";
      }

      return {
        id: notif.id,
        title: notif.title || 'Notification',
        description: notif.message,
        time: timeStr,
        type,
      };
    });

    // 6. Kunin ang huling mga audit logs para sa sidebar
    const rawAuditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        actor: {
          select: { fullName: true, role: true },
        },
      },
    })

    const auditLogs = rawAuditLogs.map((log) => {
      const timeAgo = new Intl.DateTimeFormat('fil-PH', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(new Date(log.createdAt))

      return {
        id: log.id,
        adminName: log.actor?.fullName ? `${log.actor.fullName} (${log.actor.role})` : 'Sistema',
        action: log.action,
        target: log.entityType || 'General',
        timestamp: timeAgo,
      }
    })

    return {
      adminName,
      stats: {
        totalProperties,
        totalUnits,
        totalRooms,
        occupiedRooms,
        vacantRooms,
        monthlyRevenue,
        pendingBillsAmount,
        occupancyRate,
      },
      chartData,
      pendingReadings,
      recentActivities,
      auditLogs,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      adminName: 'Admin',
      stats: { 
        totalProperties: 0, 
        totalUnits: 0, 
        totalRooms: 0, 
        occupiedRooms: 0, 
        vacantRooms: 0, 
        monthlyRevenue: 0, 
        pendingBillsAmount: 0, 
        occupancyRate: 0 
      },
      chartData: [],
      pendingReadings: [],
      recentActivities: [],
      auditLogs: [],
    }
  }
}