'use server'

import { cookies } from "next/headers";
import prisma from "@/src/lib/prisma";
import { PlanTier } from "@prisma/client";

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