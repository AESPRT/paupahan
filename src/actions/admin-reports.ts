"use server";

import prisma from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function getAdminReportsData() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, error: "Walang active session." };
    }

    const rooms = await prisma.room.findMany({
      where: {
        unit: {
          property: {
            landlordId: userId,
          },
        },
      },
      include: {
        leases: {
          where: {
            status: "active",
          },
        },
      },
    });

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(
      (r) => (r.leases && r.leases.length > 0) || r.status === "occupied"
    ).length;
    
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Ayusin ang query gamit ang 'lease.room' sa halip na 'room'
    const payments = await prisma.bill.findMany({
      where: {
        lease: {
          room: {
            unit: {
              property: {
                landlordId: userId,
              },
            },
          },
        },
        status: "paid",
      },
    });

    const totalRevenue = payments.reduce((acc, bill) => acc + Number(bill.totalAmount || 0), 0);
    const totalExpenses = 24200; 
    const netIncome = totalRevenue - totalExpenses;

    const financialSummary = {
      period: new Date().toLocaleString("fil-PH", { month: "long", year: "numeric" }),
      totalRevenue,
      totalExpenses,
      netIncome,
      occupancyRate,
    };

    return { success: true, financialSummary };
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return { success: false, error: "Nabigong kunin ang data ng mga ulat." };
  }
}

export async function generateReportAction(reportId: string, format: string) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    let fileContent = "";
    let mimeType = "text/plain";
    let fileExtension = format.toLowerCase();

    if (reportId === "rep-income") {
      const payments = await prisma.bill.findMany({
        where: { lease: { room: { unit: { property: { landlordId: userId } } } } },
        include: { tenant: true },
      });

      fileContent = "Billing ID,Tenant,Total Amount,Status,Due Date\n" +
        payments.map(p => `${p.id},"${p.tenant?.fullName || 'N/A'}",${p.totalAmount},${p.status},${p.dueDate}`).join("\n");
    } else {
      fileContent = `Ulat: ${reportId}\nPetsa: ${new Date().toISOString()}\nGenerado ng Paupahan System.`;
    }

    if (fileExtension === "csv") {
      mimeType = "text/csv";
    } else {
      mimeType = "application/octet-stream";
      fileExtension = "txt";
    }

    const base64Data = Buffer.from(fileContent).toString("base64");

    return { 
      success: true, 
      fileName: `${reportId}-${new Date().toISOString().split("T")[0]}.${fileExtension}`,
      fileData: base64Data,
      mimeType,
      message: `Matagumpay na naihanda ang ulat sa format na ${format.toUpperCase()}.`
    };
  } catch (error) {
    console.error("Error generating report:", error);
    return { success: false, error: "Nagkaroon ng problema sa pag-generate ng ulat." };
  }
}