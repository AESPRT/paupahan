'use server'

import { cookies } from "next/headers";
import prisma from "@/src/lib/prisma";
import { PlanTier } from "@prisma/client";

export interface PlanLimits {
  planTier: string;           // Prisma enum name (e.g., 'panimula', 'bahay_upa')
  planDisplayName: string;    // UI Name (e.g., 'Silong', 'Bahay-Upa')
  status: string;             // 'active', 'past_due', 'canceled', etc.
  maxUnitsLimit: number;      
  maxRoomLimit: number;       
  maxUnitsDisplay: string;
  canAddMoreUnits: boolean;
  canAddMoreRooms: boolean;
  currentUnitsCount: number;
  currentRoomsCount: number;
  canAccessAutoBilling: boolean;
  canAccessSmsReminders: boolean;
  canAccessMaintenance: boolean;
  canAccessAnalytics: boolean;
  canAccessStaffAccounts: boolean;
  canAccessNotifications: boolean;
  canAccessAuditLogs: boolean;
  canAccessTenantModule: boolean;
}

export async function checkUserSubscriptionLimits(): Promise<PlanLimits> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  // Default Fallback para sa 'Silong' (Free Plan)
  const defaultFreeLimits: PlanLimits = {
    planTier: 'panimula',
    planDisplayName: 'Silong',
    status: 'active',
    maxUnitsLimit: 1,
    maxRoomLimit: 3,
    maxUnitsDisplay: 'Hanggang 1 unit (Max na 3 rooms)',
    canAddMoreUnits: false,
    canAddMoreRooms: false,
    currentUnitsCount: 0,
    currentRoomsCount: 0,
    canAccessAutoBilling: false,
    canAccessSmsReminders: false,
    canAccessMaintenance: false,
    canAccessAnalytics: false,
    canAccessStaffAccounts: false,
    canAccessNotifications: false,
    canAccessAuditLogs: false,
    canAccessTenantModule: false,
  };

  if (!userId) {
    return defaultFreeLimits;
  }

  try {
    // 1. Kunin ang subscription ng landlord
    const subscription = await prisma.subscription.findFirst({
      where: { landlordId: userId },
    });

    // 2. Bilangin ang kasalukuyang units at rooms ng user mula sa database
    const units = await prisma.unit.findMany({
      where: { property: { landlordId: userId } },
      include: { rooms: true },
    });

    const currentUnitsCount = units.length;
    const currentRoomsCount = units.reduce((acc, unit) => acc + unit.rooms.length, 0);

    // Tukuyin ang aktibong tier (default sa 'panimula' kung walang active subscription)
    const tier = subscription && subscription.status === 'active' 
      ? subscription.planTier.toLowerCase() 
      : 'panimula';

    // 3. I-map ang mga limitasyon batay sa iyong PLANS configuration
    let maxUnits = 1;
    let maxRooms = 3;
    let displayName = 'Silong';
    let maxDisplay = 'Hanggang 1 unit (Max na 3 rooms)';

    let autoBilling = false;
    let smsReminders = false;
    let maintenance = false;
    let analytics = false;
    let staffAccounts = false;
    let notifications = false;
    let auditLogs = false;
    let tenantModule = false;

    switch (tier) {
      case 'bahay_upa': // Basic
        maxUnits = 3;
        maxRooms = 15;
        displayName = 'Bahay-Upa';
        maxDisplay = 'Hanggang 3 units (Max na 15 rooms)';
        auditLogs = true;
        notifications = true;
        break;
        
      case 'maalam': // Pasilidad (Premium)
        maxUnits = 10;
        maxRooms = 60;
        displayName = 'Pasilidad';
        maxDisplay = 'Hanggang 10 units (Max na 60 rooms)';
        auditLogs = true;
        notifications = true;
        smsReminders = true;
        maintenance = true;
        analytics = true;
        break;
        
      case 'negosyante': // Kompleto (Business)
        maxUnits = 30;
        maxRooms = 300;
        displayName = 'Kompleto';
        maxDisplay = 'Hanggang 30 units (Max na 300 rooms)';
        auditLogs = true;
        notifications = true;
        tenantModule = true;
        autoBilling = true;
        smsReminders = true;
        maintenance = true;
        analytics = true;
        break;
        
      case 'custom': // Eksklusibo
        maxUnits = 999999;
        maxRooms = 999999;
        displayName = 'Eksklusibo';
        maxDisplay = 'Unlimited units at rooms';
        auditLogs = true;
        notifications = true;
        tenantModule = true;
        autoBilling = true;
        smsReminders = true;
        maintenance = true;
        analytics = true;
        staffAccounts = true;
        break;
        
      case 'panimula':
      default:
        maxUnits = 1;
        maxRooms = 3;
        displayName = 'Silong';
        maxDisplay = 'Hanggang 1 unit (Max na 3 rooms)';
        break;
    }

    return {
      planTier: tier,
      planDisplayName: displayName,
      status: subscription?.status || 'active',
      maxUnitsLimit: maxUnits,
      maxRoomLimit: maxRooms,
      maxUnitsDisplay: maxDisplay,
      canAddMoreUnits: currentUnitsCount < maxUnits,
      canAddMoreRooms: currentRoomsCount < maxRooms,
      currentUnitsCount,
      currentRoomsCount,
      canAccessAutoBilling: autoBilling,
      canAccessSmsReminders: smsReminders,
      canAccessMaintenance: maintenance,
      canAccessAnalytics: analytics,
      canAccessStaffAccounts: staffAccounts,
      canAccessNotifications: notifications,
      canAccessAuditLogs: auditLogs,
      canAccessTenantModule: tenantModule
    };

  } catch (error) {
    console.error("Error checking subscription limits:", error);
    return defaultFreeLimits;
  }
}

export async function getAdminSubscriptionData() {
  try {
    const cookieStore = await cookies();
    const landlordId = cookieStore.get("session_user_id")?.value;

    if (!landlordId) {
      return { success: false, error: "Walang active session." };
    }

    const user = await prisma.user.findUnique({
      where: { id: landlordId },
    });

    let subscription = await prisma.subscription.findUnique({
      where: { landlordId },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          landlordId,
          planTier: PlanTier.panimula,
          status: "active",
          maxUnitsLimit: 1,
          maxRoomLimit: 3,
          paymentMethod: "GCash",
          autoRenew: true, // Default value
        },
      });
    }

    const properties = await prisma.property.findMany({
      where: { landlordId },
      include: {
        units: {
          include: {
            rooms: true,
          },
        },
      },
    });

    let totalUnits = 0;
    let totalRooms = 0;

    properties.forEach((property) => {
      totalUnits += property.units.length;
      property.units.forEach((unit) => {
        totalRooms += unit.rooms.length;
      });
    });

    const planNameMap: Record<PlanTier, string> = {
      [PlanTier.panimula]: "Silong",
      [PlanTier.bahay_upa]: "Bahay-Upa",
      [PlanTier.maalam]: "Pasilidad",
      [PlanTier.negosyante]: "Kompleto",
      [PlanTier.custom]: "Eksklusibo",
    };

    const formattedSubscription = {
      userId: landlordId,                              
      userName: user?.fullName || "",     
      userEmail: user?.email || "",                     
      userPhone: user?.phone || "",
      planName: planNameMap[subscription.planTier] || "Silong",
      status: 
        subscription.status === "active" ? "Active" : 
        subscription.status === "past_due" ? "Past Due" : 
        subscription.status === "canceled" ? "Canceled" : "Trialing",
      renewsOn: subscription.renewsOn 
        ? new Date(subscription.renewsOn).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })
        : "Wala pang petsa",
      paymentMethod: subscription.paymentMethod || "GCash",
      paymentMethodId: subscription.paymentMethodId || "",
      paymentNumber: subscription.paymentNumber || "",
      autoRenew: subscription.autoRenew ?? true, // Ipinapasa na natin ito patungo sa UI
      unitsUsed: totalUnits,         
      maxUnitsLimit: subscription.maxUnitsLimit,
      roomsUsed: totalRooms,         
      maxRoomLimit: subscription.maxRoomLimit, 
    };

    return { success: true, subscription: formattedSubscription };
  } catch (error) {
    console.error("Error fetching admin subscription:", error);
    return { success: false, error: "Nabigong makuha ang mga detalye ng subscription." };
  }
}

export async function updateLandlordSubscriptionAction(
  newPlanTier: string, 
  maxUnits: number, 
  maxRooms: number
) {
  try {
    const cookieStore = await cookies();
    const landlordId = cookieStore.get("session_user_id")?.value;

    if (!landlordId) {
      return { success: false, error: "Walang active session." };
    }

    const tierMapping: Record<string, PlanTier> = {
      "panimula": PlanTier.panimula,
      "bahay_upa": PlanTier.bahay_upa,
      "maalam": PlanTier.maalam,
      "negosyante": PlanTier.negosyante,
      "custom": PlanTier.custom,

      "Silong": PlanTier.panimula,
      "Bahay-Upa": PlanTier.bahay_upa,
      "Pasilidad": PlanTier.maalam,
      "Kompleto": PlanTier.negosyante,
      "Eksklusibo": PlanTier.custom,
    };

    const trimmedTier = newPlanTier.trim();
    const dbTier = tierMapping[trimmedTier] || PlanTier.panimula;

    await prisma.subscription.update({
      where: { landlordId },
      data: {
        planTier: dbTier,
        maxUnitsLimit: maxUnits,
        maxRoomLimit: maxRooms, 
        status: "active",
        renewsOn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return { success: false, error: "Nabigong i-update ang subscription." };
  }
}

// Bagong Server Action para i-update ang Auto-Renew status
export async function updateAutoRenewAction(autoRenew: boolean) {
  try {
    const cookieStore = await cookies();
    const landlordId = cookieStore.get("session_user_id")?.value;

    if (!landlordId) {
      return { success: false, error: "Walang active session." };
    }

    await prisma.subscription.upsert({
      where: { landlordId },
      update: { autoRenew },
      create: {
        landlordId,
        planTier: PlanTier.panimula,
        status: "active",
        autoRenew,
        maxUnitsLimit: 1,
        maxRoomLimit: 3,
        paymentMethod: "GCash",
      },
    });

    return { success: true };
  } catch (error) {
    // I-print ang totoong error sa terminal/server console
    console.error("DETALYADONG ERROR SA AUTO-RENEW:", error);
    return { success: false, error: error instanceof Error ? error.message : "Nabigong i-update ang auto-renew status." };
  }
}

// Bagong Server Action para i-update ang Payment Method (hal. pagkatapos mag-link sa PayMongo)
export async function updatePaymentMethodAction(
  paymentMethod: string, 
  paymentNumber: string, 
  paymentMethodId?: string
) {
  try {
    const cookieStore = await cookies();
    const landlordId = cookieStore.get("session_user_id")?.value;

    if (!landlordId) {
      return { success: false, error: "Walang active session." };
    }

    await prisma.subscription.update({
      where: { landlordId },
      data: { 
        paymentMethod,
        paymentNumber,
        ...(paymentMethodId ? { paymentMethodId } : {})
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating payment method:", error);
    return { success: false, error: "Nabigong i-update ang payment method." };
  }
}