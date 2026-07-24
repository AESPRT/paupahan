"use server";

import prisma from "@/src/lib/prisma";
import { MaintenanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Uri para sa category na tumutugma sa MaintenanceRequest type
type MaintenanceCategoryType = "Plumbing" | "Electrical" | "Appliance" | "Structural" | "Others";

export async function getAdminMaintenanceRequests() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, requests: [], error: "Walang active session." };
    }

    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        room: {
          unit: {
            property: {
              landlordId: userId,
            },
          },
        },
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

      // Ligtas na pag-map ng Prisma category patungo sa MaintenanceCategoryType
      let category: MaintenanceCategoryType = "Others";
      const catLower = req.category.toLowerCase();
      if (catLower === "plumbing") category = "Plumbing";
      else if (catLower === "electrical") category = "Electrical";
      else if (catLower === "appliance") category = "Appliance";
      else if (catLower === "structural") category = "Structural";

      return {
        id: req.id,
        ticketNumber: req.ticketNumber || `TICK-${req.id.slice(0, 5).toUpperCase()}`,
        unitName: req.room.unit.name,
        roomNumber: req.room.roomNumber,
        tenantName: req.tenant?.fullName || "Hindi nakatala",
        category, // 👈 Siguradong pasok na sa tamang union type
        issueTitle: req.title,
        description: req.description,
        priority,
        status,
        dateReported: new Date(req.createdAt).toISOString().split("T")[0],
        photoUrl: req.photoUrl || undefined,
        adminRemark: req.adminRemark || undefined,
      };
    });

    return { success: true, requests: formattedRequests };
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    return { success: false, requests: [], error: "Nabigong kunin ang mga maintenance requests." };
  }
}

export async function updateMaintenanceStatusAction(requestId: string, newStatus: "Pending" | "In Progress" | "Resolved" | "Rejected", adminRemark?: string) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    let prismaStatus: MaintenanceStatus = MaintenanceStatus.pending;
    if (newStatus === "In Progress") prismaStatus = MaintenanceStatus.in_progress;
    else if (newStatus === "Resolved") prismaStatus = MaintenanceStatus.resolved;
    else if (newStatus === "Rejected") prismaStatus = MaintenanceStatus.rejected;

    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status: prismaStatus,
        adminRemark: adminRemark || undefined,
      },
      include: {
        tenant: true,
      },
    });

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

    if (userId) {
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: "UPDATE_MAINTENANCE_STATUS",
          entityType: "MaintenanceRequest",
          entityId: requestId,
          metadata: { status: newStatus, adminRemark },
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