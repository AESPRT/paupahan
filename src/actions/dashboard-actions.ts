/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/src/actions/audit-actions'

export async function getDashboardData() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return getEmptyDashboardData();
    }

    // 1. Kunin ang impormasyon ng kasalukuyang nag-login na admin/landlord
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });
    const adminName = user?.fullName || "Admin";

    // 2. Kunin ang mga Property ID ng landlord
    const landlordProperties = await prisma.property.findMany({
      where: { landlordId: userId },
      select: { id: true },
    });
    const propertyIds = landlordProperties.map((p) => p.id);

    // 3. Kunin ang UNITS at i-filter ang mga status nito
    const landlordUnits = await prisma.unit.findMany({
      where: { propertyId: { in: propertyIds } },
      select: { id: true, status: true },
    });

    const unitIds = landlordUnits.map((u) => u.id);
    const totalProperties = propertyIds.length;
    const totalUnits = unitIds.length;

    // Kalkulahin ang Status ng Units
    const occupiedUnits = landlordUnits.filter(
      (u) => u.status?.toLowerCase() === "occupied"
    ).length;

    const reservedUnits = landlordUnits.filter(
      (u) => u.status?.toLowerCase() === "reserved"
    ).length;

    const vacantUnits = landlordUnits.filter(
      (u) =>
        u.status?.toLowerCase() === "vacant" ||
        u.status?.toLowerCase() === "available" ||
        !u.status
    ).length;

    // 4. Kunin ang ROOMS
    const landlordRooms = await prisma.room.findMany({
      where: { unitId: { in: unitIds } },
      select: { id: true, status: true },
    });

    const totalRooms = landlordRooms.length;
    let occupiedRooms = 0;
    let vacantRooms = 0;
    let reservedRooms = 0;

    landlordRooms.forEach((room) => {
      const status = room.status?.toLowerCase();
      if (status === "occupied") {
        occupiedRooms++;
      } else if (status === "reserved") {
        reservedRooms++;
      } else {
        vacantRooms++;
      }
    });

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    const availableRooms = vacantRooms;

    // 5. KUNIN LAHAT NG TENANT IDS (Direct + Leased Tenants)
    const directTenants = await prisma.tenant.findMany({
      where: { userId: userId },
      select: { id: true },
    });

    const leaseTenants = await prisma.tenant.findMany({
      where: {
        leases: {
          some: {
            OR: [
              { unit: { propertyId: { in: propertyIds } } },
              { room: { unit: { propertyId: { in: propertyIds } } } },
            ],
          },
        },
      },
      select: { id: true },
    });

    const tenantIds = Array.from(
      new Set([
        ...directTenants.map((t) => t.id),
        ...leaseTenants.map((t) => t.id),
      ])
    );

    // KUNIN ANG PAID BILLS (Monthly Revenue)
    const paidBills =
      tenantIds.length > 0
        ? await prisma.bill.aggregate({
            where: {
              tenantId: { in: tenantIds },
              status: { in: ["paid"] },
            },
            _sum: { totalAmount: true },
          })
        : { _sum: { totalAmount: 0 } };

    const monthlyRevenue = Number(paidBills._sum.totalAmount || 0);

    // KUNIN ANG PENDING AT DRAFT BILLS AMOUNT
    const pendingBills =
      tenantIds.length > 0
        ? await prisma.bill.aggregate({
            where: {
              tenantId: { in: tenantIds },
              status: { in: ["pending", "draft"] },
            },
            _sum: { totalAmount: true },
          })
        : { _sum: { totalAmount: 0 } };

    const pendingBillsAmount = Number(pendingBills._sum.totalAmount || 0);

    // 6. Buuin ang Chart Data para sa nakalipas na 6 na buwan
    const months = [
      "Ene", "Peb", "Mar", "Abr", "May", "Hun",
      "Hul", "Ago", "Set", "Okt", "Nob", "Dis"
    ];
    const currentDate = new Date();
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const year = currentDate.getFullYear();
      const monthIndex = currentDate.getMonth() - i;

      const startDate = new Date(year, monthIndex, 1, 0, 0, 0, 0);
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

      const monthName = months[startDate.getMonth()];

      let paidNum = 0;
      let pendingNum = 0;
      let overdueNum = 0;

      if (tenantIds.length > 0) {
        // Paid Amount kada buwan
        const paidTotal = await prisma.bill.aggregate({
          where: {
            tenantId: { in: tenantIds },
            status: { in: ["paid"] },
            paidAt: { gte: startDate, lte: endDate },
          },
          _sum: { totalAmount: true },
        });
        paidNum = Number(paidTotal._sum.totalAmount || 0);

        // Pending & Draft Amount kada buwan
        const pendingTotal = await prisma.bill.aggregate({
          where: {
            tenantId: { in: tenantIds },
            status: { in: ["pending", "draft"] },
            generatedAt: { gte: startDate, lte: endDate },
          },
          _sum: { totalAmount: true },
        });
        pendingNum = Number(pendingTotal._sum.totalAmount || 0);

        // Overdue Amount kada buwan
        const overdueTotal = await prisma.bill.aggregate({
          where: {
            tenantId: { in: tenantIds },
            status: { in: ["overdue"] },
            generatedAt: { gte: startDate, lte: endDate },
          },
          _sum: { totalAmount: true },
        });
        overdueNum = Number(overdueTotal._sum.totalAmount || 0);
      }

      const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fil-PH", {
          style: "currency",
          currency: "PHP",
          maximumFractionDigits: 0,
        }).format(val);

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

    // 7. Kunin at i-map ang mga Pending/Draft Utility Readings
    const rawPendingBills =
      tenantIds.length > 0
        ? await prisma.bill.findMany({
            where: {
              tenantId: { in: tenantIds },
              status: { in: ["draft", "pending"] },
              items: {
                some: {
                  OR: [
                    { status: { equals: "pending" } },
                    { proofPhotoUrl: { not: null } },
                    { currentReading: { not: null } },
                  ],
                },
              },
            },
            orderBy: { generatedAt: "desc" },
            take: 10,
            include: {
              tenant: {
                select: {
                  fullName: true,
                  leases: {
                    where: { status: "active" },
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
          })
        : [];

    const pendingReadings: any[] = [];

    rawPendingBills.forEach((bill) => {
      const tenantName = bill.tenant?.fullName || "Unknown Tenant";
      const activeLease = bill.tenant?.leases?.[0];
      const roomNum = activeLease?.room?.roomNumber || "";
      const unitName = activeLease?.room?.unit?.name || "";
      const unitLabel =
        unitName && roomNum
          ? `${unitName} - Bed ${roomNum}`
          : roomNum
          ? `Bed ${roomNum}`
          : unitName || "General";

      const timeAgo = new Intl.DateTimeFormat("fil-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(bill.generatedAt));

      bill.items.forEach((item) => {
        if (
          item.status?.toLowerCase() === "pending" &&
          !item.type.toLowerCase().includes("other")
        ) {
          let type: "water" | "electricity" | "amenities" | "other" = "other";
          const itemType = item.type.toLowerCase();

          if (itemType.includes("water")) type = "water";
          else if (itemType.includes("electric")) type = "electricity";
          else if (itemType.includes("amenities")) type = "amenities";

          const itemAmountFormatted = new Intl.NumberFormat("fil-PH", {
            style: "currency",
            currency: "PHP",
          }).format(Number(item.amount));

          pendingReadings.push({
            id: `${bill.id}-${item.type}`,
            billId: bill.id,
            utilityType: item.type,
            tenantName,
            unitName: unitLabel,
            type,
            readingOrAmount: `${item.currentReading || 0} ${
              item.unitLabel || "units"
            } (${itemAmountFormatted})`,
            dateSubmitted: timeAgo,
            proofPhotoUrl: item.proofPhotoUrl || undefined,
          });
        }
      });
    });

    // 8. Notifications & Recent Activities
    const rawNotifications = await prisma.notification
      .findMany({
        where: { recipientUserId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
      .catch(async () => {
        return await prisma.notification.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
        });
      });

    const recentActivities = rawNotifications.map((notif) => {
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - new Date(notif.createdAt).getTime()) / (1000 * 60)
      );

      let timeStr = `${diffInMinutes} mins ago`;
      if (diffInMinutes >= 60 && diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        timeStr = `${hours} hr${hours > 1 ? "s" : ""} ago`;
      } else if (diffInMinutes >= 1440) {
        const days = Math.floor(diffInMinutes / 1440);
        timeStr = `${days} day${days > 1 ? "s" : ""} ago`;
      } else if (diffInMinutes < 1) {
        timeStr = "Just now";
      }

      let type: "payment" | "tenant" | "maintenance" = "tenant";
      const notifType = notif.type.toLowerCase();
      if (
        notifType.includes("payment") ||
        notifType.includes("bayad") ||
        notifType.includes("bill")
      ) {
        type = "payment";
      } else if (
        notifType.includes("maintenance") ||
        notifType.includes("repair") ||
        notifType.includes("sira")
      ) {
        type = "maintenance";
      }

      return {
        id: notif.id,
        title: notif.title || "Notification",
        description: notif.message,
        time: timeStr,
        type,
      };
    });

    // 9. Audit Logs
    const rawAuditLogs = await prisma.auditLog.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        actor: {
          select: { fullName: true, role: true },
        },
      },
    });

    const auditLogs = rawAuditLogs.map((log) => {
      const timeAgo = new Intl.DateTimeFormat("fil-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(log.createdAt));

      return {
        id: log.id,
        adminName: log.actor?.fullName
          ? `${log.actor.fullName} (${log.actor.role})`
          : "Sistema",
        action: log.action,
        target: log.entityType || "General",
        timestamp: timeAgo,
      };
    });

    return {
      adminName,
      stats: {
        totalProperties,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        reservedUnits,
        totalRooms,
        occupiedRooms,
        vacantRooms,
        reservedRooms,
        monthlyRevenue,
        pendingBillsAmount,
        occupancyRate,
      },
      roomsSummary: {
        totalUnits,
        vacantUnits,
        reservedUnits,
        occupiedUnits,
        totalRooms,
        availableRooms,
        reservedRooms,
        occupiedRooms,
      },
      chartData,
      pendingReadings,
      recentActivities,
      auditLogs,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return getEmptyDashboardData();
  }
}

// Fallback empty data helper
function getEmptyDashboardData() {
  return {
    adminName: "Admin",
    stats: {
      totalProperties: 0,
      totalUnits: 0,
      occupiedUnits: 0,
      vacantUnits: 0,
      reservedUnits: 0,
      totalRooms: 0,
      occupiedRooms: 0,
      vacantRooms: 0,
      reservedRooms: 0,
      monthlyRevenue: 0,
      pendingBillsAmount: 0,
      occupancyRate: 0,
    },
    roomsSummary: {
      totalUnits: 0,
      vacantUnits: 0,
      reservedUnits: 0,
      occupiedUnits: 0,
      totalRooms: 0,
      availableRooms: 0,
      reservedRooms: 0,
      occupiedRooms: 0,
    },
    chartData: [],
    pendingReadings: [],
    recentActivities: [],
    auditLogs: [],
  };
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
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return [];
    }

    // 1. Kunin ang mga Property ID ng landlord
    const landlordProperties = await prisma.property.findMany({
      where: { landlordId: userId },
      select: { id: true },
    });
    const propertyIds = landlordProperties.map((p) => p.id);

    // 2. KUNIN LAHAT NG TENANT IDS (Direct + Leased Tenants)
    const directTenants = await prisma.tenant.findMany({
      where: { userId: userId },
      select: { id: true },
    });

    const leaseTenants = await prisma.tenant.findMany({
      where: {
        leases: {
          some: {
            OR: [
              { unit: { propertyId: { in: propertyIds } } },
              { room: { unit: { propertyId: { in: propertyIds } } } },
            ],
          },
        },
      },
      select: { id: true },
    });

    const tenantIds = Array.from(
      new Set([
        ...directTenants.map((t) => t.id),
        ...leaseTenants.map((t) => t.id),
      ])
    );

    // 3. I-determine ang month limit base sa napiling filter
    let limit = 6;
    if (filter === "3M") limit = 3;
    else if (filter === "6M") limit = 6;
    else if (filter === "1Y") limit = 12;
    else if (filter === "ALL") limit = 24;

    const months = [
      "Ene", "Peb", "Mar", "Abr", "May", "Hun",
      "Hul", "Ago", "Set", "Okt", "Nob", "Dis"
    ];
    const currentDate = new Date();
    const chartData = [];

    // 4. KUNIN ANG DATA KADA BUWAN
    for (let i = limit - 1; i >= 0; i--) {
      const year = currentDate.getFullYear();
      const monthIndex = currentDate.getMonth() - i;

      const startDate = new Date(year, monthIndex, 1, 0, 0, 0, 0);
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

      const monthName = months[startDate.getMonth()];

      let paidNum = 0;
      let pendingNum = 0;
      let overdueNum = 0;

      if (tenantIds.length > 0) {
        // Paid Total
        const paidTotal = await prisma.bill.aggregate({
          where: {
            tenantId: { in: tenantIds },
            status: { in: ["paid"] },
            paidAt: { gte: startDate, lte: endDate },
          },
          _sum: { totalAmount: true },
        });
        paidNum = Number(paidTotal._sum.totalAmount || 0);

        // Pending & Draft Total
        const pendingTotal = await prisma.bill.aggregate({
          where: {
            tenantId: { in: tenantIds },
            status: { in: ["pending", "draft"] },
            generatedAt: { gte: startDate, lte: endDate },
          },
          _sum: { totalAmount: true },
        });
        pendingNum = Number(pendingTotal._sum.totalAmount || 0);

        // Overdue Total
        const overdueTotal = await prisma.bill.aggregate({
          where: {
            tenantId: { in: tenantIds },
            status: { in: ["overdue"] },
            generatedAt: { gte: startDate, lte: endDate },
          },
          _sum: { totalAmount: true },
        });
        overdueNum = Number(overdueTotal._sum.totalAmount || 0);
      }

      const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fil-PH", {
          style: "currency",
          currency: "PHP",
          maximumFractionDigits: 0,
        }).format(val);

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
  } catch (error) {
    console.error("Error fetching revenue chart data:", error);
    return [];
  }
}