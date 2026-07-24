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
          in: ["paid"], // 👈 Sinisigurong sasalo anuman ang casing sa database
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

    // I-map patungong frontend format na inaasahan ng PaidBillHistory type
    const history = paidBills.map((bill) => {
      // Hanapin ang kaukulang payment record kung mayroon
      const payment = bill.payments[0];

      // Kalkulahin o kunin ang halaga ng utilities mula sa items
      let electricityAmount = 0;
      let waterAmount = 0;

      bill.items.forEach((item) => {
        if (item.type === "electricity") {
          electricityAmount += Number(item.amount);
        } else if (item.type === "water") {
          waterAmount += Number(item.amount);
        }
      });

      // I-format ang paid date
      const paidDateFormatted = bill.paidAt 
        ? new Intl.DateTimeFormat('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(bill.paidAt))
        : "N/A";

      return {
        id: `BILL-${bill.id.slice(0, 8).toUpperCase()}`,
        billingMonth: bill.billingMonthYear, // Halimbawa: "Hunyo 2026" o katumbas na format
        paidDate: paidDateFormatted,
        totalAmount: Number(bill.totalAmount),
        rentAmount: Number(bill.rentAmount),
        electricityAmount,
        waterAmount,
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