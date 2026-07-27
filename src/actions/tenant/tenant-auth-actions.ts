/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/src/lib/prisma";
import { cookies, headers } from "next/headers";

// Simple in-memory rate limiter store (Para sa production, mas mainam ang Redis ngunit epektibo na ito sa Next.js server instances)
const loginAttemptsMap = new Map<string, { count: number; lockUntil: number }>();

const MAX_ATTEMPTS = 5; // Pinakamaraming beses na pwedeng sumubok
const LOCK_TIME_MS = 60 * 1000; // 1 minuto na bawal mag-login kapag sumobra

export async function loginTenantAction(loginCode: string) {
  try {
    // 1. Kunin ang IP address ng user para sa rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown_ip";

    const now = Date.now();
    const attemptRecord = loginAttemptsMap.get(clientIp);

    // 2. Suriin kung naka-lock ang IP dahil sa sunod-sunod na spam/maling try
    if (attemptRecord && attemptRecord.lockUntil > now) {
      const remainingSeconds = Math.ceil((attemptRecord.lockUntil - now) / 1000);
      return {
        success: false,
        error: `Tinatantya ang masyadong maraming pagtatangka. Mangyaring maghintay ng ${remainingSeconds} segundo bago muling subukan.`,
      };
    }

    const trimmedCode = loginCode.trim();

    if (!trimmedCode) {
      return { success: false, error: "Mangyaring ilagay ang iyong Login Code." };
    }

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
            // Isama ang unit para sa Whole Unit assignment
            unit: {
              select: {
                name: true,
              },
            },
            // Isama ang room at ang unit nito para sa Bedspace/Room assignment
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

    // Kapag nagkamali sa pag-login, i-update ang attempt count
    if (!tenantRecord || tenantRecord.leases.length === 0) {
      const currentAttempts = attemptRecord ? attemptRecord.count + 1 : 1;
      
      if (currentAttempts >= MAX_ATTEMPTS) {
        loginAttemptsMap.set(clientIp, {
          count: currentAttempts,
          lockUntil: now + LOCK_TIME_MS, // I-lock ng 1 minuto
        });
        return {
          success: false,
          error: "Labis na beses na nagkamali. Pansamantalang hinarangan ang pag-login sa loob ng 1 minuto.",
        };
      }

      loginAttemptsMap.set(clientIp, {
        count: currentAttempts,
        lockUntil: 0,
      });

      return { 
        success: false, 
        error: `Hindi nakita ang aktibong account o mali ang iyong Login Code. (${MAX_ATTEMPTS - currentAttempts} na tira na lang)` 
      };
    }

    // Kung nagtagumpay ang pag-login, i-reset ang attempt counter ng IP na ito
    loginAttemptsMap.delete(clientIp);

    const activeLease = tenantRecord.leases[0];
    const cookieStore = await cookies();
    
    // I-set ang session_user_id
    cookieStore.set({
      name: "session_user_id",
      value: tenantRecord.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 Linggo
    });

    // I-set ang role cookie para sa proxy
    cookieStore.set({
      name: "user_role",
      value: "tenant",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Ligtas na pagkuha ng unit name at room number depende kung Room o Buong Unit
    const assignedUnitName = activeLease.room?.unit?.name || activeLease.unit?.name || "Main Unit";
    const assignedRoomNumber = activeLease.room?.roomNumber;

    return {
      success: true,
      tenant: {
        id: tenantRecord.id,
        fullName: tenantRecord.fullName,
        roomNumber: assignedRoomNumber,
        unitName: assignedUnitName,
      },
    };
  } catch (error) {
    console.error("Error logging in tenant:", error);
    return { success: false, error: "Nagkaroon ng problema sa sistema. Subukan muli." };
  }
}

export async function logoutTenantAction() {
  try {
    const cookieStore = await cookies();
    
    cookieStore.set({
      name: "session_user_id",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    cookieStore.set({
      name: "user_role",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return { success: true };
  } catch (error) {
    console.error("Error logging out tenant:", error);
    return { success: false, error: "Nagkaroon ng problema sa pag-logout." };
  }
}