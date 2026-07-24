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
    const reservedRooms = await prisma.room.count({
      where: { status: 'reserved' },
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

      // 1. Paid Bills
      const paidTotal = await prisma.bill.aggregate({
        where: {
          status: 'paid',
          paidAt: { gte: startDate, lte: endDate },
        },
        _sum: { totalAmount: true },
      });
      const paidNum = Number(paidTotal._sum.totalAmount || 0);

      // 2. Pending Bills
      const pendingTotal = await prisma.bill.aggregate({
        where: {
          status: 'pending',
          generatedAt: { gte: startDate, lte: endDate },
        },
        _sum: { totalAmount: true },
      });
      const pendingNum = Number(pendingTotal._sum.totalAmount || 0);

      // 3. Overdue Bills
      const overdueTotal = await prisma.bill.aggregate({
        where: {
          status: 'overdue',
          generatedAt: { gte: startDate, lte: endDate },
        },
        _sum: { totalAmount: true },
      });
      const overdueNum = Number(overdueTotal._sum.totalAmount || 0);

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

    // 4. Kunin at i-map ang mga pending na bills/readings para sa Approvals
    const rawPendingBills = await prisma.bill.findMany({
      where: { 
        status: 'draft', // ✨ Binago sa 'draft' para makita lang ang mga di pa aprubado
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
    });

    // I-flat map ang bawat item para kung may tubig at kuryente silang sabay na sinumite, hiwalay silang lilitaw sa listahan
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

      // Suriin ang bawat item ng bill (Electricity, Water, atbp.)
      bill.items.forEach((item) => {
        // ✨ I-check na ang status ay 'pending' AT may current reading o litrato na pinasa
        if (item.status == 'pending' && !item.type.toLowerCase().includes('amenities')) {
          let type: "water" | "electricity" | "rent" | "amenities" = "electricity";
          const itemType = item.type.toLowerCase();
          
          if (itemType.includes('water')) {
            type = "water";
          } else if (itemType.includes('electric')) {
            type = "electricity";
          } else if (itemType.includes('amenit') || itemType.includes('parking')) {
            type = "amenities";
          } else {
            type = "rent";
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

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { items: true },
    });

    if (!bill) {
      return { success: false, error: "Hindi mahanap ang bill." };
    }

    if (actionType === "approve") {
      if (targetUtilityType) {
        // ✨ I-update lang ang status ng partikular na item patungong 'approved'
        for (const item of bill.items) {
          if (item.type.toLowerCase() === targetUtilityType.toLowerCase()) {
            await prisma.billItem.update({
              where: { id: item.id },
              data: {
                status: "approved", // Nananatili ang reading at photo, naging approved lang ang status
              },
            });
          }
        }

        // Suriin kung may natitira pang ibang item na may status na 'pending'
        const hasRemainingPending = bill.items.some(
          item => item.type.toLowerCase() !== targetUtilityType?.toLowerCase() && item.status === "pending" && !item.type.toLowerCase().includes('amenities')
        );

        // Kung wala nang pending items, saka lang gawing 'pending' status ang buong Bill
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
      // Kapag tinanggihan (Reject), baguhin ang status sa 'rejected' at i-reset ang amount/units kung kinakailangan
      for (const item of bill.items) {
        if (!targetUtilityType || item.type.toLowerCase() === targetUtilityType.toLowerCase()) {
          await prisma.billItem.update({
            where: { id: item.id },
            data: {
              status: "rejected",
              currentReading: null,
              unitsUsed: 0,
              amount: 0,
              // Ang proofPhotoUrl ay hindi na binubura para may ebidensya pa rin kung bakit tinanggihan
            },
          });
        }
      }

      // Recalculate total utility amount ng bill
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

export async function getRevenueChartData(filter: "6M" | "1Y" = "6M") {
  'use server'
  const months = ["Ene", "Peb", "Mar", "Abr", "May", "Hun", "Hul", "Ago", "Set", "Okt", "Nob", "Dis"];
  const currentDate = new Date();
  const chartData = [];
  const limit = filter === "1Y" ? 12 : 6;

  for (let i = limit - 1; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    
    const startDate = new Date(`${year}-${monthStr}-01`);
    const endDate = new Date(year, d.getMonth() + 1, 0, 23, 59, 59);

    // 1. Paid Bills
    const paidTotal = await prisma.bill.aggregate({
      where: {
        status: 'paid',
        paidAt: { gte: startDate, lte: endDate },
      },
      _sum: { totalAmount: true },
    });
    const paidNum = Number(paidTotal._sum.totalAmount || 0);

    // 2. Pending Bills
    const pendingTotal = await prisma.bill.aggregate({
      where: {
        status: 'pending',
        generatedAt: { gte: startDate, lte: endDate },
      },
      _sum: { totalAmount: true },
    });
    const pendingNum = Number(pendingTotal._sum.totalAmount || 0);

    // 3. Overdue Bills
    const overdueTotal = await prisma.bill.aggregate({
      where: {
        status: 'overdue',
        generatedAt: { gte: startDate, lte: endDate },
      },
      _sum: { totalAmount: true },
    });
    const overdueNum = Number(overdueTotal._sum.totalAmount || 0);

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