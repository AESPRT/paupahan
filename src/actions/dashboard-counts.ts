'use server'

import prisma from '@/src/lib/prisma'
import { cookies } from 'next/headers'
import { checkUserSubscriptionLimits } from "@/src/actions/subscription-actions";

export async function getDashboardBadgeCounts() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { 
        notifications: undefined, 
        billings: undefined, 
        maintenance: undefined,
        userName: "Admin",
        userEmail: "",
        userInitials: "AD",
        canAccessAutoBilling: false,
        canAccessSmsReminders: false,
        canAccessMaintenance: false,
        canAccessAnalytics: false,
        canAccessStaffAccounts: false,
        canAccessNotifications: false,
        canAccessAuditLogs: false,
        canAccessTenantModule: false,
      };
    }

    // 1. Kunin ang detalye ng user (Landlord)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true, role: true }
    });

    // 2. Kunin ang Subscription Limits & Features
    const limits = await checkUserSubscriptionLimits();

    // 3. Kunin ang badge counts
    const unreadNotificationsCount = await prisma.notification.count({
      where: {
        recipientUserId: userId,
        status: "pending",
      },
    });

    const pendingBillingsCount = await prisma.bill.count({
      where: {
        status: "pending",
      },
    });

    const pendingMaintenanceCount = await prisma.maintenanceRequest.count({
      where: {
        status: "pending",
      },
    });

    // Kalkulahin ang initials ng pangalan (hal. "Juan Dela Cruz" -> "JD")
    const fullName = currentUser?.fullName || "Admin User";
    const nameParts = fullName.trim().split(" ");
    const initials = nameParts.length >= 2 
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : fullName.substring(0, 2).toUpperCase();

    return {
      notifications: unreadNotificationsCount > 0 ? String(unreadNotificationsCount) : undefined,
      billings: pendingBillingsCount > 0 ? String(pendingBillingsCount) : undefined,
      maintenance: pendingMaintenanceCount > 0 ? String(pendingMaintenanceCount) : undefined,
      userName: fullName,
      userRole: currentUser?.role ? currentUser.role.replace("_", " ").toUpperCase() : "PROPERTY ADMIN",
      userInitials: initials,
      
      // 👉 Idinagdag ang feature flags mula sa subscription
      canAccessAutoBilling: limits.canAccessAutoBilling,
      canAccessSmsReminders: limits.canAccessSmsReminders,
      canAccessMaintenance: limits.canAccessMaintenance,
      canAccessAnalytics: limits.canAccessAnalytics,
      canAccessStaffAccounts: limits.canAccessStaffAccounts,
      canAccessNotifications: limits.canAccessNotifications,
      canAccessAuditLogs: limits.canAccessAuditLogs,
      canAccessTenantModule: limits.canAccessTenantModule,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { 
      notifications: undefined, 
      billings: undefined, 
      maintenance: undefined,
      userName: "Juan Dela Cruz",
      userRole: "Property Admin",
      userInitials: "JD",
      
      // Default false kung may error
      canAccessAutoBilling: false,
      canAccessSmsReminders: false,
      canAccessMaintenance: false,
      canAccessAnalytics: false,
      canAccessStaffAccounts: false,
    };
  }
}