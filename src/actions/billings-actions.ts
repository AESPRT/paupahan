/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from '@/src/lib/prisma'
import { Invoice } from "@/src/types/admin/billing"
import { revalidatePath } from "next/cache"
import { cookies } from 'next/headers'
import { createAuditLog } from '@/src/actions/audit-actions'

export async function getBillingsData() {
  try {
    const dbBills = await prisma.bill.findMany({
      include: {
        tenant: {
          select: {
            fullName: true,
            leases: {
              where: { status: "active" },
              include: {
                room: { include: { unit: true } },
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
        items: true,
        payments: true,
      },
      orderBy: {
        generatedAt: "desc",
      },
    });

    const invoices: Invoice[] = dbBills.map((bill) => {
      const activeLease = bill.tenant?.leases?.[0];
      const roomNumber = activeLease?.room?.roomNumber ?? "N/A";
      const unitName = activeLease?.room?.unit?.name ?? "";
      
      const lineItems: { description: string; amount: number }[] = [];
      
      // Simulan ang pag-compute ng total mula sa renta
      let computedTotalAmount = Number(bill.rentAmount) || 0;
      if (computedTotalAmount > 0) {
        lineItems.push({ description: "Buwanang Renta", amount: computedTotalAmount });
      }

      // 2. Amenities mula sa Active Lease o bill amenitiesFee
      if (activeLease?.amenities && activeLease.amenities.length > 0) {
        activeLease.amenities.forEach((leaseAmenity) => {
          const amenityAmount = Number(leaseAmenity.amount);
          if (amenityAmount > 0) {
            computedTotalAmount += amenityAmount; // Dagdag sa total
            lineItems.push({
              description: `Amenity: ${leaseAmenity.amenity.name}${leaseAmenity.amenity.frequency ? ` (${leaseAmenity.amenity.frequency})` : ""}`,
              amount: amenityAmount,
            });
          }
        });
      } else if (Number(bill.amenitiesFee) > 0) {
        const fallbackAmenities = Number(bill.amenitiesFee);
        computedTotalAmount += fallbackAmenities; // Dagdag sa total
        lineItems.push({ description: "Amenities Fee", amount: fallbackAmenities });
      }

      // 3. Utilities / Bill Items (Isasama lamang sa line items at totalAmount KUNG "approved" na)
      if (bill.items && bill.items.length > 0) {
        bill.items.forEach((item) => {
          const itemAmount = Number(item.amount);
          const isUtility = item.type === "electricity" || item.type === "water";
          const isApproved = item.status === "approved";

          if (itemAmount > 0 && item.type && item.type.toUpperCase() !== "AMENITIES") {
            if (!isUtility) {
              // Kung hindi utility at may halaga, isama agad
              computedTotalAmount += itemAmount;
              lineItems.push({
                description: `${item.type.toUpperCase()} (${item.currentReading ? `Reading: ${item.currentReading}` : 'Item'})`,
                amount: itemAmount,
              });
            } else if (isUtility && isApproved) {
              // Kung utility, ISASAMA LAMANG sa total at line items kung ito ay APPROVED na
              computedTotalAmount += itemAmount;
              lineItems.push({
                description: `${item.type.toUpperCase()} (Reading: ${item.currentReading ?? 'N/A'})`,
                amount: itemAmount,
              });
            }
            // Kung ang utility ay pending o hindi pa approved, hindi ito idaragdag sa computedTotalAmount at hindi rin ipapakita sa lineItems.
          }
        });
      } else if (Number(bill.utilityAmount) > 0) {
        // Fallback kung naka-rely sa bill.utilityAmount (I-check kung approved ba ang bill status o hayaan kung ganoon ang business logic)
        const utilityAmt = Number(bill.utilityAmount);
        computedTotalAmount += utilityAmt;
        lineItems.push({ description: "Kuryente / Tubig Utilities", amount: utilityAmt });
      }

      let status: Invoice["status"] = "Draft";
      if (bill.status === "paid") status = "Paid";
      else if (bill.status === "overdue") status = "Overdue";
      else if (bill.status === "pending" || (bill.payments && bill.payments.length > 0)) {
        status = "Pending";
      }

      const latestPayment = bill.payments[0];

      return {
        id: bill.id,
        invoiceNumber: `INV-${bill.id.slice(0, 8).toUpperCase()}`,
        tenantName: bill.tenant?.fullName ?? "Unknown Tenant",
        unitRoom: unitName ? `${unitName} - Room ${roomNumber}` : `Room ${roomNumber}`,
        issueDate: bill.generatedAt.toISOString().split("T")[0],
        dueDate: bill.dueDate.toISOString().split("T")[0],
        lineItems,
        totalAmount: computedTotalAmount, // 👈 Ginamit natin ang dynamically computed total na walang unapproved utilities
        status,
        paymentDetails: latestPayment ? {
          method: latestPayment.paymentMethod,
          referenceNo: latestPayment.referenceNo,
          receiptUrl: bill.paymentReceiptUrl,
        } : undefined,
      } as any;
    });

    return { success: true, invoices };
  } catch (error) {
    console.error("Error fetching billings data from DB:", error);
    return { success: false, invoices: [], error: "Nabigong kunin ang mga datos ng billing mula sa database." };
  }
}

export async function createInvoiceAction(newInvoiceData: Omit<Invoice, "id" | "invoiceNumber">) {
  try {
    // 1. Hanapin muna ang tenant at ang active lease nito base sa pangalan na pinasa mula sa UI
    const tenant = await prisma.tenant.findFirst({
      where: {
        fullName: {
          contains: newInvoiceData.tenantName,
          mode: 'insensitive',
        },
      },
      include: {
        leases: {
          where: { status: 'active' },
          take: 1,
        },
      },
    });

    if (!tenant || tenant.leases.length === 0) {
      return { 
        success: false, 
        error: `Hindi mahanap ang aktibong lease para sa tenant na si "${newInvoiceData.tenantName}". Siguraduhing nakarehistro na siya.` 
      };
    }

    const activeLease = tenant.leases[0];
    const billingMonthYear = newInvoiceData.issueDate.slice(0, 7);

    // 2. Kalkulahin o kunin ang rent amount at iba pang fees mula sa line items
    let rentAmount = 0;
    let amenitiesFee = 0;
    let utilityAmount = 0;

    newInvoiceData.lineItems.forEach(item => {
      const desc = item.description.toLowerCase();
      if (desc.includes('rent') || desc.includes('renta')) {
        rentAmount += item.amount;
      } else if (desc.includes('utilities')) {
        amenitiesFee += item.amount;
      } else {
        utilityAmount += item.amount;
      }
    });

    if (rentAmount === 0 && newInvoiceData.totalAmount > 0) {
      rentAmount = newInvoiceData.totalAmount;
    }

    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;
    
    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }
    
    await createAuditLog({
      actorId: adminId,
      action: `Gumawa ng bagong invoice para sa tenant: ${tenant.fullName}, Room: ${activeLease.roomId}, Halaga: ${newInvoiceData.totalAmount}`,
      entityType: 'Billing',
      entityId: adminId,
      metadata: { actionType: 'ADD' },
    });

    // 3. I-save ang Bill at ang mga kaugnay na BillItems sa database
    await prisma.bill.create({
      data: {
        leaseId: activeLease.id,
        tenantId: tenant.id,
        billingMonthYear: billingMonthYear,
        dueDate: new Date(newInvoiceData.dueDate),
        rentAmount: rentAmount,
        amenitiesFee: amenitiesFee,
        utilityAmount: utilityAmount,
        totalAmount: newInvoiceData.totalAmount,
        status: 'draft',
        generatedAt: new Date(newInvoiceData.issueDate),
        items: {
          create: newInvoiceData.lineItems.map(item => {
            const desc = item.description.toLowerCase();
            
            let itemType: "electricity" | "water" | "internet" | "amenities" = "amenities";
            if (desc.includes('tubig') || desc.includes('water')) {
              itemType = 'water';
            } else if (desc.includes('kuryente') || desc.includes('electric')) {
              itemType = 'electricity';
            } else if (desc.includes('utilities') || desc.includes('wifi')) {
              itemType = 'amenities';
            }

            return {
              type: itemType,
              unitLabel: item.description,
              amount: desc.includes('rent') || desc.includes('renta') ? 0 : item.amount,
              ratePerUnit: item.amount,
              // ✨ Tinanggal muli ang 'status' dito para maiwasan ang PrismaClientValidationError
            };
          }),
        },
      },
    });

    revalidatePath("/admin/billings");
    return { success: true };
  } catch (error) {
    console.error("Error creating invoice in DB:", error);
    return { success: false, error: "Nabigong i-save ang bagong invoice sa database." };
  }
}

export async function markInvoiceAsPaidAction(id: string) {
  try {
    // I-update ang status ng Bill sa Prisma database
    await prisma.bill.update({
      where: { id },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });

    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;
    
    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }
    
    await createAuditLog({
      actorId: adminId,
        action: `Minarkahan bilang bayad ang invoice ID: ${id}`,
        entityType: 'Billing',
        entityId: adminId,
        metadata: { actionType: 'ADD' },
    })

    revalidatePath("/admin/billings");
    return { success: true };
  } catch (error) {
    console.error("Error marking invoice as paid in DB:", error);
    return { success: false, error: "Nabigong i-update ang status ng invoice." };
  }
}

export async function getOccupiedRoomsForBilling() {
  try {
    // Kunin ang mga active leases kasama ang room, unit, tenant, at ang kanilang leaseAmenities
    const activeLeases = await prisma.lease.findMany({
      where: {
        status: "active",
      },
      include: {
        tenant: {
          select: {
            fullName: true,
          },
        },
        room: {
          include: {
            unit: {
              select: {
                name: true,
              },
            },
          },
        },
        // 👈 Dito natin kukunin ang nakatalagang amenities gamit ang iyong LeaseAmenity model
        amenities: {
          include: {
            amenity: {
              select: {
                name: true,
                frequency: true,
              },
            },
          },
        },
      },
    });

    // I-format ang data para sa frontend modal dropdown
    const roomsWithTenants = activeLeases.map((lease) => {
      // I-map ang LeaseAmenity para makuha ang pangalan at amount
      const formattedAmenities = lease.amenities.map((item) => ({
        id: item.amenityId,
        name: item.amenity.name,
        amount: Number(item.amount ?? 0),
        frequency: item.amenity.frequency ?? "Buwanan",
      }));

      return {
        leaseId: lease.id, // Opsyonal: maganda ring isama ang leaseId para madaling i-reference
        roomId: lease.room.id,
        roomNumber: lease.room.roomNumber,
        unitName: lease.room.unit?.name ?? "Main Unit",
        tenantName: lease.tenant?.fullName ?? "Unknown Tenant",
        monthlyRent: Number(lease.monthlyRent ?? lease.room.monthlyRent ?? 0),
        amenities: formattedAmenities, // 👈 Awtomatikong isasama rito ang nakatakdang amenities ng tenant!
      };
    });

    return { success: true, roomsWithTenants };
  } catch (error) {
    console.error("Error fetching occupied rooms with lease amenities:", error);
    return { success: false, roomsWithTenants: [], error: "Nabigong kunin ang mga occupied rooms." };
  }
}