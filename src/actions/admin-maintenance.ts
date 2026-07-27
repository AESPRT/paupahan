/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/src/lib/prisma";
import { MaintenanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import axios from 'axios';
import { detectCarrier } from "@/src/utils/carrierDetector";

type MaintenanceCategoryType = "Plumbing" | "Electrical" | "Appliance" | "Structural" | "Others";

export async function getAdminMaintenanceRequests() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, requests: [], error: "Walang active session." };
    }

    // Sinusuportahan na nito ang parehong Room/Bedspace at Buong Unit maintenance requests
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        OR: [
          {
            room: {
              unit: {
                property: {
                  landlordId: userId,
                },
              },
            },
          },
          {
            unit: {
              property: {
                landlordId: userId,
              },
            },
          },
        ],
      },
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
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedRequests = maintenanceRequests.map((req) => {
      let status: "Pending" | "In Progress" | "Resolved" | "Rejected" = "Pending";
      if (req.status === "in_progress") status = "In Progress";
      else if (req.status === "resolved") status = "Resolved";
      else if (req.status === "rejected") status = "Rejected";

      let priority: "Low" | "Medium" | "High" | "Emergency" = "Medium";
      if (req.priority === "low") priority = "Low";
      else if (req.priority === "high") priority = "High";
      else if (req.priority === "emergency") priority = "Emergency";

      let category: MaintenanceCategoryType = "Others";
      const catLower = req.category.toLowerCase();
      if (catLower === "plumbing") category = "Plumbing";
      else if (catLower === "electrical") category = "Electrical";
      else if (catLower === "appliance") category = "Appliance";
      else if (catLower === "structural") category = "Structural";

      // Ligtas na pagkuha ng pangalan ng unit at room number kung mayroon man
      const resolvedUnitName = req.room?.unit?.name || req.unit?.name || "Walang Unit";
      const resolvedRoomNumber = req.room?.roomNumber ? `Room ${req.room.roomNumber}` : "Buong Unit";

      return {
        id: req.id,
        ticketNumber: req.ticketNumber || `TICK-${req.id.slice(0, 5).toUpperCase()}`,
        unitName: resolvedUnitName,
        roomNumber: resolvedRoomNumber,
        tenantName: req.tenant?.fullName || "Hindi nakatala",
        category,
        issueTitle: req.title,
        description: req.description,
        priority,
        status,
        dateReported: new Date(req.createdAt).toISOString().split("T")[0],
        imageUrl: req.photoUrl || undefined,
        adminRemark: req.adminRemark || undefined,
        expenses: req.expenses ?? 0,
      };
    });

    return { success: true, requests: formattedRequests };
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    return { success: false, requests: [], error: "Nabigong kunin ang mga maintenance requests." };
  }
}

export async function updateMaintenanceStatusAction(
    requestId: string, 
    newStatus: "Pending" | "In Progress" | "Resolved" | "Rejected", 
    adminRemark?: string,
    expenses?: number
  ) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    let prismaStatus: MaintenanceStatus = MaintenanceStatus.pending;
    if (newStatus === "In Progress") prismaStatus = MaintenanceStatus.in_progress;
    else if (newStatus === "Resolved") prismaStatus = MaintenanceStatus.resolved;
    else if (newStatus === "Rejected") prismaStatus = MaintenanceStatus.rejected;

    const updateData: any = {
      status: prismaStatus,
      adminRemark: adminRemark || undefined,
    };

    if (newStatus === "Resolved") {
      updateData.expenses = expenses !== undefined ? expenses : 0;
    }

    // I-update ang maintenance request kasama ang relasyon sa room o unit patungong landlord
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        tenant: { select: { id: true, fullName: true, email: true, phone: true, userId: true } },
        room: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    landlord: { select: { fullName: true } },
                  },
                },
              },
            },
          },
        },
        unit: {
          include: {
            property: {
              include: {
                landlord: { select: { fullName: true } },
              },
            },
          },
        },
      },
    }) as any;

    if (updatedRequest.tenant?.userId) {
      await prisma.notification.create({
        data: {
          recipientUserId: updatedRequest.tenant.userId,
          type: "MAINTENANCE_UPDATE",
          channel: "in_app",
          title: "Na-update ang Maintenance Request Mo",
          message: `Ang iyong request na "${updatedRequest.title}" ay na-update na sa status na: ${newStatus}.`,
          relatedEntityType: "MaintenanceRequest",
          relatedEntityId: requestId,
          status: "pending",
        },
      });
    }

    const tenantEmail = updatedRequest.tenant?.email;
    const tenantPhone = updatedRequest.tenant?.phone;
    const tenantName = updatedRequest.tenant?.fullName || "Tenant";
    
    // Ligtas na pagkuha ng pangalan ng landlord mula sa Room o Unit relation
    const landlordName = updatedRequest.room?.unit?.property?.landlord?.fullName || 
                         updatedRequest.unit?.property?.landlord?.fullName || 
                         "Landlord";
    
    const issueTitle = updatedRequest.title || "Maintenance Request";
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

    if (tenantEmail) {
      try {
        await axios.post(`${API_BASE_URL}/notify/maintenance`, {
          tenantName: tenantName,
          tenantEmail: tenantEmail,
          landlordName: landlordName,
          issueTitle: issueTitle,
          status: newStatus,
          maintenanceNotes: adminRemark || (expenses ? `Gastos sa pag-aayos: ₱${expenses.toLocaleString()}` : undefined),
        }, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET_TOKEN}`
          }
        });
      } catch (emailErr) {
        console.error(`Error sa pagpapadala ng maintenance email kay ${tenantEmail}:`, emailErr);
      }
    }

    if (tenantPhone) {
      try {
        const smsMessage = `Paupahan Maintenance: Ang iyong request na "${issueTitle}" ay nasa status na ngayon: ${newStatus}.${adminRemark ? ` Tala: ${adminRemark}` : ''}`;
        const detectedCarrier = detectCarrier(tenantPhone);
        
        await axios.post(`${API_BASE_URL}/notify/sms`, {
          phoneNumber: tenantPhone,
          carrier: detectedCarrier,
          message: smsMessage,
        });
      } catch (smsErr) {
        console.error(`Error sa pagpapadala ng SMS kay ${tenantPhone}:`, smsErr);
      }
    }

    if (userId) {
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: "UPDATE_MAINTENANCE_STATUS",
          entityType: "MaintenanceRequest",
          entityId: requestId,
          metadata: { status: newStatus, adminRemark, expenses: updateData.expenses },
        },
      });
    }

    revalidatePath("/admin/dashboard/maintenance");
    return { success: true, message: "Matagumpay na na-update ang status!" };
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    return { success: false, error: "Nagkaroon ng problema sa pag-update." };
  }
}