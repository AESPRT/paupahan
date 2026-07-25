"use server";

import prisma from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getTenantBillsData() {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("session_user_id")?.value;

    if (!tenantId) {
      return { success: false, error: "Walang active session." };
    }

    const tenantBills = await prisma.bill.findMany({
      where: { tenantId },
      include: {
        items: true,
        // 👇 Kunin ang aktibong lease at ang mga nakatalagang amenities nito para sa tenant na ito
        tenant: {
          select: {
            leases: {
              where: { status: "active" },
              include: {
                amenities: {
                  include: {
                    amenity: {
                      select: { name: true, frequency: true },
                    },
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
      orderBy: { generatedAt: "desc" },
    });

    const formattedBills = tenantBills.map((bill) => {
      const electricityItem = bill.items.find((i) => i.type === "electricity");
      const waterItem = bill.items.find((i) => i.type === "water");

      // ✨ Kunin ang mga active lease amenities ng tenant
      const activeLease = bill.tenant?.leases?.[0];
      const leaseAmenities = activeLease?.amenities || [];

      // Kalkulahin ang kabuuang halaga ng amenities mula sa lease, o mag-fallback sa bill.amenitiesFee kung meron man
      const calculatedAmenitiesFee = leaseAmenities.length > 0
        ? leaseAmenities.reduce((sum, item) => sum + Number(item.amount), 0)
        : Number(bill.amenitiesFee);

      let uiStatus = "Pending Tenant Input";
      if (bill.status === "paid") {
        uiStatus = "Paid";
      } else if (bill.status === "overdue") {
        uiStatus = "Overdue";
      } else if (bill.status === "pending") {
        uiStatus = "Pending Payment"; 
      } else if (bill.status === "draft") {
        if (electricityItem?.currentReading || waterItem?.currentReading) {
          uiStatus = "Pending Landlord Approval";
        } else {
          uiStatus = "Draft Pending Readings";
        }
      }

      return {
        id: bill.id,
        monthYear: bill.billingMonthYear,
        dueDate: new Date(bill.dueDate).toLocaleDateString("fil-PH", { year: 'numeric', month: 'long', day: 'numeric' }),
        status: uiStatus,
        rentAmount: Number(bill.rentAmount),
        amenitiesFee: calculatedAmenitiesFee, // 👈 Dynamic na kabuuang halaga ng amenities
        amenitiesList: leaseAmenities.map((item) => ({             // 👈 Detalyadong listahan kung gusto mong i-display sa UI
          name: item.amenity.name,
          amount: Number(item.amount),
          frequency: item.amenity.frequency,
        })),
        totalAmount: Number(bill.totalAmount),
        paidAt: bill.paidAt ? new Date(bill.paidAt).toLocaleDateString("fil-PH", { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
        electricity: {
          type: "electricity" as const,
          previousReading: electricityItem?.previousReading ? Number(electricityItem.previousReading) : 0,
          currentReading: electricityItem?.currentReading ? Number(electricityItem.currentReading) : undefined,
          ratePerUnit: electricityItem ? Number(electricityItem.ratePerUnit) : 12.5,
          unitLabel: electricityItem?.unitLabel || "kWh",
          proofPhotoUrl: electricityItem?.proofPhotoUrl || undefined,
          status: electricityItem?.status === "approved" ? "Approved" 
            : electricityItem?.status === "rejected" ? "Rejected (Mag-submit muli)" 
            : electricityItem?.currentReading ? "Pending Landlord Approval" 
            : "Pending Tenant Input",
        },
        water: {
          type: "water" as const,
          previousReading: waterItem?.previousReading ? Number(waterItem.previousReading) : 0,
          currentReading: waterItem?.currentReading ? Number(waterItem.currentReading) : undefined,
          ratePerUnit: waterItem ? Number(waterItem.ratePerUnit) : 45.0,
          unitLabel: waterItem?.unitLabel || "m³",
          proofPhotoUrl: waterItem?.proofPhotoUrl || undefined,
          status: waterItem?.status === "approved" ? "Approved" 
            : waterItem?.status === "rejected" ? "Rejected (Mag-submit muli)" 
            : waterItem?.currentReading ? "Pending Landlord Approval" 
            : "Pending Tenant Input",
        },
      };
    });

    return { success: true, bills: formattedBills };
  } catch (error) {
    console.error("Error fetching tenant bills:", error);
    return { success: false, error: "Nabigong makuha ang mga resibo at bayarin." };
  }
}

// Action para i-submit ng tenant ang kanilang meter reading at proof photo
export async function updateTenantUtilityReadingAction(
  billId: string,
  utilityType: "electricity" | "water",
  currentReading: number,
  proofPhotoUrl: string
) {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { items: true },
    });

    if (!bill) {
      return { success: false, error: "Hindi mahanap ang bill." };
    }

    const billItem = bill.items.find((i) => i.type === utilityType);

    const utilityRateConfig = await prisma.utilityRate.findUnique({
      where: { type: utilityType },
    });

    const ratePerUnit = utilityRateConfig ? Number(utilityRateConfig.ratePerUnit) : (utilityType === "electricity" ? 12.5 : 45.0);
    const unitLabel = utilityRateConfig ? utilityRateConfig.unitLabel : (utilityType === "electricity" ? "kWh" : "m³");

    let previousReading = 0;

    if (billItem) {
      previousReading = Number(billItem.previousReading || 0);
    } else {
      const previousBillItem = await prisma.billItem.findFirst({
        where: {
          type: utilityType,
          bill: {
            tenantId: bill.tenantId,
            id: { not: billId },
          },
        },
        orderBy: { bill: { generatedAt: "desc" } },
      });

      if (previousBillItem && previousBillItem.currentReading) {
        previousReading = Number(previousBillItem.currentReading);
      }
    }

    const unitsUsed = Math.max(0, currentReading - previousReading);
    const newUtilityAmount = unitsUsed * ratePerUnit;

    if (billItem) {
      await prisma.billItem.update({
        where: { id: billItem.id },
        data: {
          currentReading,
          amount: newUtilityAmount,
          proofPhotoUrl,
          // ✨ Tinanggal ang status dito para hindi mag-error sa DB schema
        },
      });
    } else {
      await prisma.billItem.create({
        data: {
          billId,
          type: utilityType,
          previousReading,
          currentReading,
          ratePerUnit,
          unitLabel,
          proofPhotoUrl,
          amount: newUtilityAmount,
          // ✨ Tinanggal din ang status dito
        },
      });
    }

    const updatedItems = await prisma.billItem.findMany({
      where: { billId },
    });

    let totalUtilityAmount = 0;
    updatedItems.forEach((item) => {
      if (item.type === "electricity" || item.type === "water" || item.type === "amenities") {
        if (item.type === utilityType) {
          totalUtilityAmount += newUtilityAmount;
        } else {
          totalUtilityAmount += Number(item.amount);
        }
      }
    });

    const rentAmount = Number(bill.rentAmount || 0);
    const amenitiesFee = Number(bill.amenitiesFee || 0);
    const newTotalAmount = rentAmount + amenitiesFee + totalUtilityAmount;

    await prisma.bill.update({
      where: { id: billId },
      data: {
        utilityAmount: totalUtilityAmount,
        totalAmount: newTotalAmount,
        status: "draft", 
      },
    });

    revalidatePath("/tenant/dashboard/bills");
    return { success: true };
  } catch (error) {
    console.error("Error updating utility reading:", error);
    return { success: false, error: "Nagkaroon ng problema sa pag-save ng reading." };
  }
}