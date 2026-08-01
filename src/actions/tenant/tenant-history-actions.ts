'use server'

import prisma from '@/src/lib/prisma'
import { cookies } from 'next/headers'

export async function getTenantPaymentHistory() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, history: [], error: "Walang active session." };
    }

    // Hanapin ang tenant profile gamit ang userId
    const tenant = await prisma.tenant.findUnique({
      where: { id: userId },
    });

    if (!tenant) {
      return { success: false, history: [], error: "Hindi mahanap ang tenant profile." };
    }

    // Kunin ang lahat ng bayad o paid bills ng tenant kasama ang items at payments nito
    const paidBills = await prisma.bill.findMany({
      where: {
        tenantId: tenant.id,
        status: {
          in: ["paid"],
        },
      },
      include: {
        items: true,
        payments: true,
      },
      orderBy: {
        paidAt: "desc",
      },
    });

    // I-map patungong frontend format na may tiyak na uri (Type-safe)
    const history = paidBills.map((bill) => {
      const payment = bill.payments[0];

      let electricityAmount = 0;
      let waterAmount = 0;

      let electricityItemData: {
        amount: number;
        consumed?: number;
        previousReading?: number;
        currentReading?: number;
        unitLabel: string;
      } | undefined = undefined;

      let waterItemData: {
        amount: number;
        consumed?: number;
        previousReading?: number;
        currentReading?: number;
        unitLabel: string;
      } | undefined = undefined;

      bill.items.forEach((item) => {
        const itemAmount = Number(item.amount);
        const prev = item.previousReading != null ? Number(item.previousReading) : null;
        const curr = item.currentReading != null ? Number(item.currentReading) : null;
        const consumedVal = prev !== null && curr !== null ? curr - prev : undefined;

        if (item.type === "electricity") {
          electricityAmount += itemAmount;
          electricityItemData = {
            amount: itemAmount,
            consumed: consumedVal,
            previousReading: prev !== null ? prev : undefined,
            currentReading: curr !== null ? curr : undefined,
            unitLabel: item.unitLabel || "kWh",
          };
        } else if (item.type === "water") {
          waterAmount += itemAmount;
          waterItemData = {
            amount: itemAmount,
            consumed: consumedVal,
            previousReading: prev !== null ? prev : undefined,
            currentReading: curr !== null ? curr : undefined,
            unitLabel: item.unitLabel || "m³",
          };
        }
      });

      // I-format ang paid date
      const paidDateFormatted = bill.paidAt 
        ? new Intl.DateTimeFormat('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(bill.paidAt))
        : "N/A";

      return {
        id: `BILL-${bill.id.slice(0, 8).toUpperCase()}`,
        billingMonth: bill.billingMonthYear,
        paidDate: paidDateFormatted,
        totalAmount: Number(bill.totalAmount),
        rentAmount: Number(bill.rentAmount),
        electricityAmount,
        waterAmount,
        electricity: electricityItemData,
        water: waterItemData,
        paymentMethod: payment?.paymentMethod ?? "Online Payment",
        referenceNumber: payment?.referenceNo ?? "N/A",
        receiptUrl: bill.paymentReceiptUrl || undefined,
      };
    });

    return { success: true, history };
  } catch (error) {
    console.error("Error fetching tenant payment history:", error);
    return { success: false, history: [], error: "Nabigong kunin ang payment history." };
  }
}