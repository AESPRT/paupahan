/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // Kunin ang tenant, active lease, room, unit, property, at mga bills
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        leases: {
          where: { status: "active" },
          include: {
            unit: {
              include: {
                property: true,
              },
            },
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
            items: true,
          },
        },
        maintenanceRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        user: {
          select: {
            paymentSettings: true,
          },
        },
      },
    });

    if (!tenant || tenant.leases.length === 0) {
      return { success: false, error: "Hindi nahanap ang aktibong lease ng tenant." };
    }

    const activeLease = tenant.leases[0];
    
    // Alamin kung ang lease ay nakatali sa Room (Bedspace) o sa Buong Unit
    const room = activeLease.room;
    const unit = room?.unit || activeLease.unit;
    const property = unit?.property;
    const latestBill = tenant.bills[0] || null;
    const latestTicket = tenant.maintenanceRequests[0] || null;

    if (!property || !unit) {
      return { success: false, error: "May kulang na impormasyon sa ari-arian o unit." };
    }

    // Kunin ang Landlord payment settings mula sa property landlord
    const landlordUser = await prisma.user.findUnique({
      where: { id: property.landlordId },
      select: { paymentSettings: true },
    });

    const paymentSettings = (landlordUser?.paymentSettings as any) || {};

    // I-parse ang utility items mula sa bill items
    const electricityItem = latestBill?.items.find((i) => i.type === "electricity");
    const waterItem = latestBill?.items.find((i) => i.type === "water");

    // Ligtas na pagbuo ng pangalan ng lokasyon (Room + Unit o Buong Unit lang)
    const roomName = room 
      ? `Room ${room.roomNumber} - ${unit.name}` 
      : `Buong Unit - ${unit.name}`;

    // Formatted Data para sa Dashboard Frontend
    const dashboardData = {
      tenantName: tenant.fullName,
      roomName: roomName,
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