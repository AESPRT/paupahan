/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// 1. Kunin ang lahat ng settings data ng landlord kasama ang Utility Rates
export async function getAdminSettings() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, error: "Walang active session." };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        properties: {
          take: 1,
        },
      },
    });

    if (!user) {
      return { success: false, error: "Hindi natagpuan ang user." };
    }

    const property = user.properties[0] || null;

    // Kunin ang global/standard utility rates mula sa UtilityRate table
    const utilityRates = await prisma.utilityRate.findMany();
    const electricityRate = utilityRates.find(u => u.type === "electricity");
    const waterRate = utilityRates.find(u => u.type === "water");

    return {
      success: true,
      profile: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
      },
      property: property ? {
        propertyName: property.name,
        address: property.addressLine,
        defaultGracePeriodDays: (property.propertySettings as any)?.defaultGracePeriodDays || 5,
        lateFeePercentage: (property.propertySettings as any)?.lateFeePercentage || 0,
        // Kunin ang rate mula sa UtilityRate table kung mayroon, o fallback sa JSON settings
        waterRatePerCubic: waterRate ? Number(waterRate.ratePerUnit) : ((property.propertySettings as any)?.waterRatePerCubic || 0),
        electricityRatePerKwh: electricityRate ? Number(electricityRate.ratePerUnit) : ((property.propertySettings as any)?.electricityRatePerKwh || 0),
      } : {
        propertyName: "",
        address: "",
        defaultGracePeriodDays: 5,
        lateFeePercentage: 0,
        waterRatePerCubic: waterRate ? Number(waterRate.ratePerUnit) : 0,
        electricityRatePerKwh: electricityRate ? Number(electricityRate.ratePerUnit) : 0,
      },
      payment: user.paymentSettings || {
        gcashNumber: "",
        gcashName: "",
        mayaNumber: "",
        mayaName: "",
        bankName: "",
        bankAccountNo: "",
        bankAccountName: "",
        isGcashActive: false,
        isMayaActive: false,
        isBankActive: false,
      },
      notifications: user.notificationSettings || {
        emailAlerts: true,
        smsAlerts: false,
        autoRemindOverdue: true,
      },
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { success: false, error: "Nabigong kunin ang mga setting." };
  }
}

// 2. I-save ang Profile Settings
export async function updateProfileSettings(data: { fullName: string; phone: string }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
      },
    });

    revalidatePath("/admin/dashboard/settings");
    return { success: true, message: "Matagumpay na na-update ang profile!" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Nabigong i-update ang profile." };
  }
}

// 3. I-save ang Property Settings at i-sync din sa UtilityRate table
export async function updatePropertySettings(data: {
  propertyName: string;
  address: string;
  defaultGracePeriodDays: number;
  lateFeePercentage: number;
  waterRatePerCubic: number;
  electricityRatePerKwh: number;
}) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;
    if (!userId) return { success: false, error: "Unauthorized" };

    const property = await prisma.property.findFirst({
      where: { landlordId: userId },
    });

    const propertySettingsJson = {
      defaultGracePeriodDays: data.defaultGracePeriodDays,
      lateFeePercentage: data.lateFeePercentage,
      waterRatePerCubic: data.waterRatePerCubic,
      electricityRatePerKwh: data.electricityRatePerKwh,
    };

    if (property) {
      await prisma.property.update({
        where: { id: property.id },
        data: {
          name: data.propertyName,
          addressLine: data.address,
          propertySettings: propertySettingsJson,
        },
      });
    } else {
      await prisma.property.create({
        data: {
          landlordId: userId,
          name: data.propertyName,
          addressLine: data.address,
          city: "Quezon City",
          propertySettings: propertySettingsJson,
        },
      });
    }

    // I-sync din ang kuryente at tubig sa UtilityRate table para magtugma ang Utilities at Settings page
    await prisma.utilityRate.upsert({
      where: { type: "electricity" },
      update: { ratePerUnit: data.electricityRatePerKwh },
      create: {
        type: "electricity",
        name: "Kuryente",
        ratePerUnit: data.electricityRatePerKwh,
        unitLabel: "kWh",
      },
    });

    await prisma.utilityRate.upsert({
      where: { type: "water" },
      update: { ratePerUnit: data.waterRatePerCubic },
      create: {
        type: "water",
        name: "Tubig",
        ratePerUnit: data.waterRatePerCubic,
        unitLabel: "m³",
      },
    });

    revalidatePath("/admin/dashboard/settings");
    revalidatePath("/admin/dashboard/utilities");
    return { success: true, message: "Matagumpay na na-update ang property settings at utility rates!" };
  } catch (error) {
    console.error("Error updating property settings:", error);
    return { success: false, error: "Nabigong i-update ang property settings." };
  }
}

// 4. I-save ang Payment Settings
export async function updatePaymentSettings(paymentData: any) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        paymentSettings: paymentData,
      },
    });

    revalidatePath("/admin/dashboard/settings");
    return { success: true, message: "Matagumpay na na-update ang mga paraan ng pagbabayad!" };
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return { success: false, error: "Nabigong i-update ang payment settings." };
  }
}

// 5. I-save ang Security & Notifications Settings
export async function updateSecuritySettings(notificationData: any) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        notificationSettings: notificationData,
      },
    });

    revalidatePath("/admin/dashboard/settings");
    return { success: true, message: "Matagumpay na na-update ang mga abiso at seguridad!" };
  } catch (error) {
    console.error("Error updating security settings:", error);
    return { success: false, error: "Nabigong i-update ang mga setting ng abiso." };
  }
}