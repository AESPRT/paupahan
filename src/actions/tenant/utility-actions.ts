'use server'

import { cookies } from "next/headers";
import prisma from "@/src/lib/prisma"; // Siguruhing tama ang path ng iyong prisma client

export async function getTenantUtilitiesAndAmenities() {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("session_user_id")?.value;

    if (!tenantId) {
      return { success: false, rates: [], amenities: [], error: "Walang active session." };
    }

    // 1. Kunin ang utility rates mula sa database
    const dbRates = await prisma.utilityRate.findMany({
      orderBy: { type: 'asc' },
    });

    const rates = dbRates.map((rate) => ({
      id: rate.id,
      type: rate.type,
      name: rate.name,
      ratePerUnit: Number(rate.ratePerUnit),
      unitLabel: rate.unitLabel,
    }));

    // 2. Kunin ang active lease ng tenant kasama ang mga nakatalagang amenities
    const activeLease = await prisma.lease.findFirst({
      where: {
        tenantId,
        status: "active",
      },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    const amenities = activeLease?.amenities.map((item) => ({
      id: item.id,
      name: item.amenity.name,
      amount: Number(item.amount),
      billingType: item.amenity.frequency || "Buwanan",
      description: item.amenity.description || "Nakatalaga sa iyong kasalukuyang upa.",
      isIncluded: true,
    })) || [];

    return { success: true, rates, amenities };
  } catch (error) {
    console.error("Error fetching tenant utilities and amenities:", error);
    return { success: false, rates: [], amenities: [], error: "Nabigong makuha ang mga datos." };
  }
}