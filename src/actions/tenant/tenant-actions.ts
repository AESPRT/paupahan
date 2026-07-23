"use server";

import prisma from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBillDetailsForPayment(billId: string) {
  try {
    // Kunin ang bill kasama ang mga items nito (para sa submeter/utilities)
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        items: true, // Kasama ang kuryente, tubig, amenities, atbp.
      },
    });

    if (!bill) {
      return null;
    }

    // I-format ang month/year kung paano mo ito gustong ipakita
    const monthYearFormatted = bill.billingMonthYear; 

    // I-format ang due date para maging mabasa
    const dueDateFormatted = new Date(bill.dueDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return {
      id: bill.id,
      tenantId: bill.tenantId, // 👈 Idinagdag ito rito para mawala ang TypeScript error
      monthYear: monthYearFormatted,
      totalAmount: Number(bill.totalAmount),
      dueDate: dueDateFormatted,
      status: bill.status,
    };
  } catch (error) {
    console.error("Error fetching bill details for payment:", error);
    return null;
  }
}

export async function submitPaymentAction(formData: FormData) {
  try {
    const billId = formData.get("billId") as string;
    const tenantId = formData.get("tenantId") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const referenceNo = formData.get("referenceNo") as string;
    const amount = Number(formData.get("amount"));
    const receiptUrl = formData.get("receiptUrl") as string; // O kaya ay URL mula sa iyong file upload handler

    if (!billId || !tenantId || !amount) {
      return { success: false, error: "Kulang ang mga kinakailangang impormasyon." };
    }

    // 1. I-save ang payment record sa `payments` table
    await prisma.payment.create({
      data: {
        billId,
        tenantId,
        amount,
        paymentMethod,
        referenceNo: referenceNo || null,
      },
    });

    // 2. I-update ang status ng bill sa `bills` table (halimbawa: gawing pending approval o bayad na, depende sa workflow mo)
    await prisma.bill.update({
      where: { id: billId },
      data: {
        status: "pending", // o "paid" kung automatic kapag naisumite
        paymentReceiptUrl: receiptUrl || null,
      },
    });

    // I-revalidate ang path para mag-update ang UI
    revalidatePath(`/tenant/payment/${billId}`);
    revalidatePath(`/tenant/dashboard/home`);

    return { success: true, message: "Matagumpay na naisumite ang iyong bayad!" };
  } catch (error) {
    console.error("Error submitting payment:", error);
    return { success: false, error: "Nagkaroon ng problema sa pagproseso ng iyong bayad." };
  }
}