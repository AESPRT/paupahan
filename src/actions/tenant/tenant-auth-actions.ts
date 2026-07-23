"use server";

import prisma from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function loginTenantAction(loginCode: string) {
  try {
    const trimmedCode = loginCode.trim();

    if (!trimmedCode) {
      return { success: false, error: "Mangyaring ilagay ang iyong Login Code." };
    }

    // Hanapin ang tenant gamit ang login code at ang active lease nito
    const tenantRecord = await prisma.tenant.findFirst({
      where: {
        loginCode: trimmedCode,
        leases: {
          some: {
            status: "active",
          },
        },
      },
      include: {
        leases: {
          where: {
            status: "active",
          },
          include: {
            room: {
              include: {
                unit: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!tenantRecord || tenantRecord.leases.length === 0) {
      return { 
        success: false, 
        error: "Hindi nakita ang aktibong account o mali ang iyong Login Code." 
      };
    }

    const activeLease = tenantRecord.leases[0];

    // I-set ang session cookie para sa proxy/middleware
    const cookieStore = await cookies();
    cookieStore.set({
      name: "session_user_id",
      value: tenantRecord.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 Linggo
    });

    return {
      success: true,
      tenant: {
        id: tenantRecord.id,
        fullName: tenantRecord.fullName,
        roomNumber: activeLease.room.roomNumber,
        unitName: activeLease.room.unit?.name ?? "Main Unit",
      },
    };
  } catch (error) {
    console.error("Error logging in tenant:", error);
    return { success: false, error: "Nagkaroon ng problema sa sistema. Subukan muli." };
  }
}