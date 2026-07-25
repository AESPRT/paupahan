/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/src/actions/audit-actions'

export async function getDashboardData() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('session_user_id')?.value

    if (!userId) {
      return {
        adminName: 'Admin',
        stats: { totalProperties: 0, totalUnits: 0, totalRooms: 0, occupiedRooms: 0, vacantRooms: 0, reservedRooms: 0, monthlyRevenue: 0, pendingBillsAmount: 0, occupancyRate: 0 },
        chartData: [],
        pendingReadings: [],
        recentActivities: [],
        auditLogs: [],
      }
    }

    // 1. Kunin ang impormasyon ng kasalukuyang nag-login na admin/landlord
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    })
    const adminName = user?.fullName || 'Admin'

    // 2. Kunin ang mga Property ID na pagmamay-ari ng landlord na ito para sa filtering ng units at rooms
    const landlordProperties = await prisma.property.findMany({
      where: { landlordId: userId },
      select: { id: true },
    })
    const propertyIds = landlordProperties.map((p) => p.id)

    // Kunin ang mga Unit ID sa ilalim ng mga property na ito
    const landlordUnits = await prisma.unit.findMany({
      where: { propertyId: { in: propertyIds } },
      select: { id: true },
    })
    const unitIds = landlordUnits.map((u) => u.id)

    // Kunin ang mga Room ID sa ilalim ng mga unit na ito
    const landlordRooms = await prisma.room.findMany({
      where: { unitId: { in: unitIds } },
      select: { id: true },
    })
    const roomIds = landlordRooms.map((r) => r.id)

    // 3. Kunin ang kabuuang stats na naka-isolate sa landlord na ito
    const totalProperties = propertyIds.length
    const totalUnits = unitIds.length
    const totalRooms = roomIds.length

    const occupiedRooms = roomIds.length > 0 ? await prisma.room.count({
      where: { id: { in: roomIds }, status: 'occupied' },
    }) : 0

    const vacantRooms = roomIds.length > 0 ? await prisma.room.count({
      where: { id: { in: roomIds }, status: 'vacant' },
    }) : 0

    const reservedRooms = roomIds.length > 0 ? await prisma.room.count({
      where: { id: { in: roomIds }, status: 'reserved' },
    }) : 0
    
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

    // Kunin ang mga Tenant ID sa ilalim ng landlord na ito para sa pag-filter ng Bills
    const landlordTenants = await prisma.tenant.findMany({
      where: { userId: userId },
      select: { id: true },
    })
    const tenantIds = landlordTenants.map((t) => t.id)

    // Pag-compute ng buwanang kita (Paid bills para sa mga tenant niya lang)
    const paidBills = tenantIds.length > 0 ? await prisma.bill.aggregate({
      where: { tenantId: { in: tenantIds }, status: 'paid' },
      _sum: { totalAmount: true },
    }) : { _sum: { totalAmount: 0 } }
    const monthlyRevenue = Number(paidBills._sum.totalAmount || 0)

    // Pending bills amount para sa mga tenant niya lang
    const pendingBills = tenantIds.length > 0 ? await prisma.bill.aggregate({
      where: { tenantId: { in: tenantIds }, status: 'pending' },
      _sum: { totalAmount: true },
    }) : { _sum: { totalAmount: 0 } }
    const pendingBillsAmount = Number(pendingBills._sum.totalAmount || 0)

    // 4. Buuin ang Chart Data para sa nakalipas na 6 na buwan (nakabase sa mga tenant niya)
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

      let paidNum = 0;
      let pendingNum = 0;
      let overdueNum = 0;

      if (tenantIds.length > 0) {
        const paidTotal = await prisma.bill.aggregate({
          where: {
            tenantId: { in: tenantIds },
            status: 'paid',
            paidAt: { gte: startDate, lte: endDate },
          },
          _sum: { totalAmount: true },
        });
        paidNum = Number(paidTotal._sum.totalAmount || 0);

        const pendingTotal = await prisma.bill.aggregate({
          where: {
            tenantId: { in: tenantIds },
            status: 'pending',
            generatedAt: { gte: startDate, lte: endDate },
          },
          _sum: { totalAmount: true },
        });
        pendingNum = Number(pendingTotal._sum.totalAmount || 0);

        const overdueTotal = await prisma.bill.aggregate({
          where: {
            tenantId: { in: tenantIds },
            status: 'overdue',
            generatedAt: { gte: startDate, lte: endDate },
          },
          _sum: { totalAmount: true },
        });
        overdueNum = Number(overdueTotal._sum.totalAmount || 0);
      }

      const formatCurrency = (val: number) => 
        new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(val);

      chartData.push({
        month: monthName,
        paid: paidNum,
        pending: pendingNum,
        overdue: overdueNum,
        paidFormatted: formatCurrency(paidNum),
        pendingFormatted: formatCurrency(pendingNum),
        overdueFormatted: formatCurrency(overdueNum),
      });
    }

    // 5. Kunin at i-map ang mga pending na bills/readings para sa Approvals (para sa mga tenant niya lang)
    const rawPendingBills = tenantIds.length > 0 ? await prisma.bill.findMany({
      where: { 
        tenantId: { in: tenantIds },
        status: 'draft',
        items: {
          some: {
            OR: [
              { status: { equals: 'pending' } },
              { proofPhotoUrl: { not: null } },
              { currentReading: { not: null } }
            ]
          }
        }
      },
      orderBy: { generatedAt: 'desc' },
      take: 10,
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
        items: true,
      },
    }) : [];

    const pendingReadings: any[] = [];

    rawPendingBills.forEach((bill) => {
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

      bill.items.forEach((item) => {
        if (item.status == 'pending' && !item.type.toLowerCase().includes('other')) {
          let type: "water" | "electricity" | "amenities" | "other" = "other";
          const itemType = item.type.toLowerCase();
          
          if (itemType.includes('water')) {
            type = "water";
          } else if (itemType.includes('electric')) {
            type = "electricity";
          } else if (itemType.includes('amenities')) {
            type = "amenities";
          } else {
            type = "other";
          }

          const itemAmountFormatted = new Intl.NumberFormat('fil-PH', {
            style: 'currency',
            currency: 'PHP',
          }).format(Number(item.amount));

          pendingReadings.push({
            id: `${bill.id}-${item.type}`, 
            billId: bill.id, 
            utilityType: item.type, 
            tenantName,
            unitName: unitLabel,
            type,
            readingOrAmount: `${item.currentReading || 0} ${item.unitLabel || 'units'} (${itemAmountFormatted})`,
            dateSubmitted: timeAgo,
            proofPhotoUrl: item.proofPhotoUrl || undefined,
          });
        }
      });
    });

    // 6. Kunin ang mga notifications para sa landlord na ito (kung sinusuportahan ng schema, o i-filter base sa actor/target)
    const rawNotifications = await prisma.notification.findMany({
      where: { recipientUserId: userId }, // Sinisigurong sa kanya lang ang notifications
      orderBy: { createdAt: 'desc' },
      take: 5,
    }).catch(async () => {
      // Fallback kung walang userId column ang notification table
      return await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    });

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

    // 7. Kunin ang audit logs na ginawa lamang ng landlord na ito
    const rawAuditLogs = await prisma.auditLog.findMany({
      where: { actorId: userId },
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
        reservedRooms,
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
        reservedRooms: 0,
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

export async function handleApprovalAction(compositeId: string, actionType: "approve" | "reject") {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    let billId = compositeId;
    let targetUtilityType: string | null = null;

    if (compositeId.endsWith("-electricity")) {
      billId = compositeId.replace("-electricity", "");
      targetUtilityType = "electricity";
    } else if (compositeId.endsWith("-water")) {
      billId = compositeId.replace("-water", "");
      targetUtilityType = "water";
    } else if (compositeId.endsWith("-amenities")) {
      billId = compositeId.replace("-amenities", "");
      targetUtilityType = "amenities";
    }

    // Siguraduhing ang bill ay pagmamay-ari ng tenant na nasa ilalim ng landlord na ito
    const landlordTenants = await prisma.tenant.findMany({
      where: { userId: adminId },
      select: { id: true },
    });
    const tenantIds = landlordTenants.map((t) => t.id);

    const bill = await prisma.bill.findFirst({
      where: { 
        id: billId,
        tenantId: { in: tenantIds } // 👈 Security check para hindi mapakialaman ang bill ng iba
      },
      include: { items: true },
    });

    if (!bill) {
      return { success: false, error: "Hindi mahanap ang bill o wala kang karapatan dito." };
    }

    if (actionType === "approve") {
      if (targetUtilityType) {
        for (const item of bill.items) {
          if (item.type.toLowerCase() === targetUtilityType.toLowerCase()) {
            await prisma.billItem.update({
              where: { id: item.id },
              data: {
                status: "approved",
              },
            });
          }
        }

        const hasRemainingPending = bill.items.some(
          item => item.type.toLowerCase() !== targetUtilityType?.toLowerCase() && item.status === "pending" && !item.type.toLowerCase().includes('other')
        );

        if (!hasRemainingPending) {
          await prisma.bill.update({
            where: { id: billId },
            data: { status: "pending" },
          });
        }
      }

      await createAuditLog({
        actorId: adminId,
        action: `Inaprubahan ang ${targetUtilityType || 'utility'} reading para sa Bill: ${billId}`,
        entityType: 'Bill',
        entityId: adminId,
        metadata: { actionType: 'APPROVAL' },
      });

    } else {
      for (const item of bill.items) {
        if (!targetUtilityType || item.type.toLowerCase() === targetUtilityType.toLowerCase()) {
          await prisma.billItem.update({
            where: { id: item.id },
            data: {
              status: "rejected",
              currentReading: null,
              amount: 0,
            },
          });
        }
      }

      const updatedBill = await prisma.bill.findUnique({ 
        where: { id: billId },
        include: { items: true }
      });

      if (updatedBill) {
        let totalUtilityAmount = 0;
        updatedBill.items.forEach(item => {
          totalUtilityAmount += Number(item.amount || 0);
        });

        const baseAmount = Number(updatedBill.rentAmount) + Number(updatedBill.amenitiesFee);
        const newTotalAmount = baseAmount + totalUtilityAmount;

        await prisma.bill.update({
          where: { id: billId },
          data: {
            utilityAmount: totalUtilityAmount,
            totalAmount: newTotalAmount,
          },
        });
      }

      await createAuditLog({
        actorId: adminId,
        action: `Tinanggihan ang ${targetUtilityType || 'utility'} reading para sa Bill: ${billId}`,
        entityType: 'Bill',
        entityId: adminId,
        metadata: { actionType: 'APPROVAL' },
      });
    }

    revalidatePath("/admin/dashboard/home");
    revalidatePath("/admin/billings");
    return { success: true };
  } catch (error) {
    console.error("Error in handleApprovalAction:", error);
    return { success: false, error: "Nagkaroon ng problema sa sistema." };
  }
}

export async function getRevenueChartData(filter: "3M" | "6M" | "1Y" | "ALL" = "6M") {
  'use server'
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  const months = ["Ene", "Peb", "Mar", "Abr", "May", "Hun", "Hul", "Ago", "Set", "Okt", "Nob", "Dis"];
  const currentDate = new Date();
  const chartData = [];
  
  // Tinukoy natin ang limit base sa bagong filters
  let limit = 6;
  if (filter === "3M") limit = 3;
  else if (filter === "6M") limit = 6;
  else if (filter === "1Y") limit = 12;
  else if (filter === "ALL") limit = 24; // Halimbawa: huling 2 taon para sa 'Lahat'

  let tenantIds: string[] = [];
  if (userId) {
    const landlordTenants = await prisma.tenant.findMany({
      where: { userId: userId },
      select: { id: true },
    });
    tenantIds = landlordTenants.map((t) => t.id);
  }

  for (let i = limit - 1; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    
    const startDate = new Date(`${year}-${monthStr}-01`);
    const endDate = new Date(year, d.getMonth() + 1, 0, 23, 59, 59);

    let paidNum = 0;
    let pendingNum = 0;
    let overdueNum = 0;

    if (tenantIds.length > 0) {
      const paidTotal = await prisma.bill.aggregate({
        where: {
          tenantId: { in: tenantIds },
          status: 'paid',
          paidAt: { gte: startDate, lte: endDate },
        },
        _sum: { totalAmount: true },
      });
      paidNum = Number(paidTotal._sum.totalAmount || 0);

      const pendingTotal = await prisma.bill.aggregate({
        where: {
          tenantId: { in: tenantIds },
          status: 'pending',
          generatedAt: { gte: startDate, lte: endDate },
        },
        _sum: { totalAmount: true },
      });
      pendingNum = Number(pendingTotal._sum.totalAmount || 0);

      const overdueTotal = await prisma.bill.aggregate({
        where: {
          tenantId: { in: tenantIds },
          status: 'overdue',
          generatedAt: { gte: startDate, lte: endDate },
        },
        _sum: { totalAmount: true },
      });
      overdueNum = Number(overdueTotal._sum.totalAmount || 0);
    }

    const formatCurrency = (val: number) => 
      new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(val);

    chartData.push({
      month: monthName,
      paid: paidNum,
      pending: pendingNum,
      overdue: overdueNum,
      paidFormatted: formatCurrency(paidNum),
      pendingFormatted: formatCurrency(pendingNum),
      overdueFormatted: formatCurrency(overdueNum),
    });
  }

  return chartData;
}