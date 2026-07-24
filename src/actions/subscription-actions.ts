/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { cookies } from "next/headers";
import prisma from "@/src/lib/prisma";

export async function getAdminSubscriptionData() {
  try {
    const cookieStore = await cookies();
    const landlordId = cookieStore.get("session_user_id")?.value;

    if (!landlordId) {
      return { success: false, error: "Walang active session." };
    }

    // 1. Kunin ang subscription ng landlord sa database
    let subscription = await prisma.subscription.findUnique({
      where: { landlordId },
    });

    // Kung wala pang record, gawan natin ng default (Panimula tier)
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          landlordId,
          planTier: "panimula",
          status: "active",
          maxUnitsLimit: 1,
          maxRoomLimit: 3,
          paymentMethod: "GCash",
        },
      });
    }

    // 2. Bilangin ang kabuuang units at rooms sa lahat ng properties ng landlord
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

    // I-map ang plan tier sa pangalang nakasanayan sa UI
    const planNameMap: Record<string, string> = {
      panimula: "Panimula",
      bahay_upa: "Bahay-Upa",
      maalam: "Maalam",
      negosyante: "Negosyante",
      custom: "Ayon sa'yo",
    };

    const formattedSubscription = {
      planName: planNameMap[subscription.planTier] || "Panimula",
      status: 
        subscription.status === "active" ? "Active" : 
        subscription.status === "past_due" ? "Past Due" : 
        subscription.status === "canceled" ? "Canceled" : "Trialing",
      renewsOn: subscription.renewsOn 
        ? new Date(subscription.renewsOn).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })
        : "Wala pang petsa",
      paymentMethod: subscription.paymentMethod || "GCash",
      unitsUsed: totalUnits,         // 👈 Bilang ng nagawang units
      maxUnitsLimit: subscription.maxUnitsLimit,
      roomsUsed: totalRooms,         // 👈 Bilang ng nagawang rooms
      maxRoomLimit: subscription.maxRoomLimit, // 👈 Limit ng rooms base sa plan
    };

    return { success: true, subscription: formattedSubscription };
  } catch (error) {
    console.error("Error fetching admin subscription:", error);
    return { success: false, error: "Nabigong makuha ang mga detalye ng subscription." };
  }
}

// Server Action para sa pag-upgrade ng plan (Tumatanggap na ngayon ng maxUnits at maxRooms)
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

    // I-convert ang pangalan patungong enum format ng database
    const tierMapping: Record<string, any> = {
      "Panimula": "panimula",
      "Bahay-Upa": "bahay_upa",
      "Maalam": "maalam",
      "Negosyante": "negosyante",
      "Ayon sa'yo": "custom",
    };

    const dbTier = tierMapping[newPlanTier] || "panimula";

    await prisma.subscription.update({
      where: { landlordId },
      data: {
        planTier: dbTier,
        maxUnitsLimit: maxUnits,
        maxRoomLimit: maxRooms, // 👈 Na-save na nang diretso ang bagong room limit
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