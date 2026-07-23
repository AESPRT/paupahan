"use server";

import prisma from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function getTenantDashboardData() {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("session_user_id")?.value;

    if (!tenantId) {
      return { success: false, error: "Walang active session." };
    }

    // Kunin ang tenant, ang kasalukuyang active lease nito, room, unit, property, at mga bills
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        leases: {
          where: { status: "active" },
          include: {
            room: {
              include: {
                unit: {
                  include: {
                    property: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
        bills: {
          orderBy: { generatedAt: "desc" },
          take: 1,
          include: {
            items: true, // Para sa kuryente, tubig, atbp.
          },
        },
        maintenanceRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        user: {
          select: {
            paymentSettings: true, // Dito nakalagay ang GCash/Bank details ng landlord kung sinet nila
          },
        },
      },
    });

    if (!tenant || tenant.leases.length === 0) {
      return { success: false, error: "Hindi nahanap ang aktibong lease ng tenant." };
    }

    const activeLease = tenant.leases[0];
    const room = activeLease.room;
    const unit = room.unit;
    const property = unit.property;
    const latestBill = tenant.bills[0] || null;
    const latestTicket = tenant.maintenanceRequests[0] || null;

    // Kunin ang Landlord payment settings mula sa property o landlord user
    const landlordUser = await prisma.user.findUnique({
      where: { id: property.landlordId },
      select: { paymentSettings: true },
    });

    const paymentSettings = (landlordUser?.paymentSettings as any) || {
      gcash: { number: "N/A", name: "Landlord" },
      bank: { bankName: "N/A", accountNumber: "N/A", accountName: "Landlord" },
    };

    // I-parse ang utility items mula sa bill items kung mayroon man
    const electricityItem = latestBill?.items.find((i) => i.type === "electricity");
    const waterItem = latestBill?.items.find((i) => i.type === "water");

    // Formatted Data para sa Dashboard Frontend
    const dashboardData = {
      tenantName: tenant.fullName,
      roomName: `Room ${room.roomNumber} - ${unit.name}`,
      propertyName: property.name,
      billingMonth: latestBill ? latestBill.billingMonthYear : "Kasalukuyang Buwan",
      totalBillThisMonth: latestBill ? Number(latestBill.totalAmount) : 0,
      pendingBalance: latestBill && latestBill.status !== "paid" ? Number(latestBill.totalAmount) : 0,
      dueDate: latestBill ? new Date(latestBill.dueDate).toLocaleDateString("fil-PH", { year: 'numeric', month: 'long', day: 'numeric' }) : "Wala pang due date",
      paymentStatus: latestBill ? latestBill.status.charAt(0).toUpperCase() + latestBill.status.slice(1) : "Wala",
      
      electricity: {
        previousReading: electricityItem?.previousReading ? Number(electricityItem.previousReading) : 0,
        currentReading: electricityItem?.currentReading ? Number(electricityItem.currentReading) : 0,
        kwhUsed: electricityItem && electricityItem.currentReading && electricityItem.previousReading 
          ? Number(electricityItem.currentReading) - Number(electricityItem.previousReading) 
          : 0,
        ratePerKwh: electricityItem ? Number(electricityItem.ratePerUnit) : 0,
        totalAmount: electricityItem ? Number(electricityItem.amount) : 0,
      },

      water: {
        previousReading: waterItem?.previousReading ? Number(waterItem.previousReading) : 0,
        currentReading: waterItem?.currentReading ? Number(waterItem.currentReading) : 0,
        cubicUsed: waterItem && waterItem.currentReading && waterItem.previousReading 
          ? Number(waterItem.currentReading) - Number(waterItem.previousReading) 
          : 0,
        ratePerCubic: waterItem ? Number(waterItem.ratePerUnit) : 0,
        totalAmount: waterItem ? Number(waterItem.amount) : 0,
      },

      activeTicket: latestTicket ? {
        id: latestTicket.ticketNumber || latestTicket.id.slice(0, 8),
        title: latestTicket.title,
        category: latestTicket.category,
        priority: latestTicket.priority,
        status: latestTicket.status,
        description: latestTicket.description,
        photoUrl: latestTicket.photoUrl || "",
        createdAt: new Date(latestTicket.createdAt).toLocaleDateString("fil-PH", { year: 'numeric', month: 'long', day: 'numeric' }),
      } : undefined,

      landlordPayments: paymentSettings,
    };

    return { success: true, data: dashboardData };
  } catch (error) {
    console.error("Error fetching tenant dashboard data:", error);
    return { success: false, error: "Nabigong makuha ang mga impormasyon sa dashboard." };
  }
}