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
      orderBy: { generatedAt: "asc" },
    });

    if (tenantBills.length === 0) {
      return { success: true, bills: [] };
    }

    // ✨ Ginawa nating synchronous map dahil wala namang async sa loob
    const formattedBills = tenantBills.map((bill, index) => {
      const electricityItem = bill.items.find((i) => i.type === "electricity");
      const waterItem = bill.items.find((i) => i.type === "water");

      let prevElectricityReading = electricityItem?.previousReading ? Number(electricityItem.previousReading) : 0;
      let prevWaterReading = waterItem?.previousReading ? Number(waterItem.previousReading) : 0;

      if ((!prevElectricityReading || prevElectricityReading === 0) && index > 0) {
        const previousBill = tenantBills[index - 1];
        const prevElecItem = previousBill.items.find((i) => i.type === "electricity");
        if (prevElecItem?.currentReading) {
          prevElectricityReading = Number(prevElecItem.currentReading);
        }
      }

      if ((!prevWaterReading || prevWaterReading === 0) && index > 0) {
        const previousBill = tenantBills[index - 1];
        const prevWaterItem = previousBill.items.find((i) => i.type === "water");
        if (prevWaterItem?.currentReading) {
          prevWaterReading = Number(prevWaterItem.currentReading);
        }
      }

      const activeLease = bill.tenant?.leases?.[0];
      const leaseAmenities = activeLease?.amenities || [];

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
      } else if (bill.status === "payment_submitted") {
        uiStatus = "Pending Verification"; 
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
        amenitiesFee: calculatedAmenitiesFee,
        amenitiesList: leaseAmenities.map((item) => ({
          name: item.amenity.name,
          amount: Number(item.amount),
          frequency: item.amenity.frequency,
        })),
        totalAmount: Number(bill.totalAmount),
        paidAt: bill.paidAt ? new Date(bill.paidAt).toLocaleDateString("fil-PH", { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
        electricity: {
          type: "electricity" as const,
          previousReading: prevElectricityReading,
          currentReading: electricityItem?.currentReading ? Number(electricityItem.currentReading) : undefined,
          ratePerUnit: electricityItem ? Number(electricityItem.ratePerUnit) : 12.5,
          unitLabel: electricityItem?.unitLabel || "kWh",
          proofPhotoUrl: electricityItem?.proofPhotoUrl || undefined,
          // ✨ Dito natin binabasa ang status ng item mula sa database
          status: electricityItem?.status === "approved" ? "Approved" 
            : electricityItem?.status === "rejected" ? "Rejected" 
            : electricityItem?.currentReading ? "Pending Landlord Approval" 
            : "Pending Tenant Input",
        },
        water: {
          type: "water" as const,
          previousReading: prevWaterReading,
          currentReading: waterItem?.currentReading ? Number(waterItem.currentReading) : undefined,
          ratePerUnit: waterItem ? Number(waterItem.ratePerUnit) : 45.0,
          unitLabel: waterItem?.unitLabel || "m³",
          proofPhotoUrl: waterItem?.proofPhotoUrl || undefined,
          status: waterItem?.status === "approved" ? "Approved" 
            : waterItem?.status === "rejected" ? "Rejected" 
            : waterItem?.currentReading ? "Pending Landlord Approval" 
            : "Pending Tenant Input",
        },
      };
    }).reverse(); // 👈 Diretso nang nai-reverse pagkatapos i-map

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

    // 💡 Kunin ang tamang previous reading
    let previousReading = 0;

    if (billItem && billItem.previousReading !== null && Number(billItem.previousReading) > 0) {
      previousReading = Number(billItem.previousReading);
    } else {
      // Hanapin ang huling reading mula sa nakaraang bill kung wala pa sa kasalukuyang item
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
      // ✨ I-update pati ang previousReading para nakasulat na ito nang tuwiran sa database
      await prisma.billItem.update({
        where: { id: billItem.id },
        data: {
          previousReading,
          currentReading,
          amount: newUtilityAmount,
          proofPhotoUrl,
          status: "pending", // 👈 I-reset ang status mula rejected patungong pending para ma-review ulit ni landlord
        },
      });
    } else {
      // ✨ Isama ang previousReading sa pag-create ng bagong billItem
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
          status: "pending", // 👈 Bagong item ay pending din
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

export async function checkTenantHasPendingBillsAction() {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("tenantId")?.value; // O kung paano man nakukuha ang session ng tenant mo

    if (!tenantId) {
      return { success: true, hasPending: false };
    }

    // Halimbawa ng query sa database kung saan ang status ay "draft" o "pending_reading"
    // Baguhin ang prisma model name at condition base sa iyong schema structure
    const pendingBill = await prisma.bill.findFirst({
      where: {
        tenantId: tenantId,
        status: {
          in: ["draft", "pending", "overdue"], // I-adjust depende sa status enums mo
        },
      },
    });

    return {
      success: true,
      hasPending: !!pendingBill,
    };
  } catch (error) {
    console.error("Error checking pending bills:", error);
    return { success: false, hasPending: false };
  }
}