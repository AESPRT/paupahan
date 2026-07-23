"use server";

import prisma from '@/src/lib/prisma'
import { Invoice } from "@/src/types/admin/billing"
import { revalidatePath } from "next/cache"

export async function getBillingsData() {
  try {
    // Kunin ang mga bills/invoices kasama ang pangalan ng tenant at room mula sa database
    const dbBills = await prisma.bill.findMany({
      include: {
        tenant: {
          select: {
            fullName: true,
          },
        },
        lease: {
          include: {
            room: {
              include: {
                unit: true,
              },
            },
          },
        },
        items: true, // Isama na rin ang bill items para mas tumpak kung sakaling kinakailangan
      },
      orderBy: {
        generatedAt: "desc",
      },
    });

    // I-map ang database models patungo sa Invoice type ng frontend
    const invoices: Invoice[] = dbBills.map((bill) => {
      const roomNumber = bill.lease?.room?.roomNumber ?? "N/A";
      const unitName = bill.lease?.room?.unit?.name ?? "";
      
      // Kung may items galing sa database, gamitin iyon; kung wala, i-fallback sa lumang computation
      let lineItems = bill.items.map(item => ({
        description: item.unitLabel || item.type,
        amount: Number(item.amount)
      }));

      if (lineItems.length === 0) {
        lineItems = [
          { description: "Buwanang Renta", amount: Number(bill.rentAmount) },
          ...(Number(bill.amenitiesFee) > 0 ? [{ description: "Amenities Fee", amount: Number(bill.amenitiesFee) }] : []),
          ...(Number(bill.utilityAmount) > 0 ? [{ description: "Kuryente / Tubig Utilities", amount: Number(bill.utilityAmount) }] : []),
        ];
      }

      // I-normalize ang status para sumunod sa frontend types (Pending, Paid, Overdue, Draft)
      let status: Invoice["status"] = "Pending";
      if (bill.status === "paid") status = "Paid";
      else if (bill.status === "overdue") status = "Overdue";
      else if (bill.status === "draft") status = "Draft";

      return {
        id: bill.id,
        invoiceNumber: `INV-${bill.id.slice(0, 8).toUpperCase()}`,
        tenantName: bill.tenant?.fullName ?? "Unknown Tenant",
        unitRoom: unitName ? `${unitName} - Room ${roomNumber}` : `Room ${roomNumber}`,
        issueDate: bill.generatedAt.toISOString().split("T")[0],
        dueDate: bill.dueDate.toISOString().split("T")[0],
        lineItems,
        totalAmount: Number(bill.totalAmount),
        status,
      };
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
          mode: 'insensitive', // Para hindi sensitive sa capital/small letters
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
    const billingMonthYear = newInvoiceData.issueDate.slice(0, 7); // Kunin ang YYYY-MM galing sa issue date

    // 2. Kalkulahin o kunin ang rent amount at iba pang fees mula sa line items
    let rentAmount = 0;
    let amenitiesFee = 0;
    let utilityAmount = 0;

    newInvoiceData.lineItems.forEach(item => {
      const desc = item.description.toLowerCase();
      if (desc.includes('rent') || desc.includes('renta')) {
        rentAmount += item.amount;
      } else if (desc.includes('amenities')) {
        amenitiesFee += item.amount;
      } else {
        utilityAmount += item.amount;
      }
    });

    // Fallback kung walang naka-specify na rent pero may total amount
    if (rentAmount === 0 && newInvoiceData.totalAmount > 0) {
      rentAmount = newInvoiceData.totalAmount;
    }

    // 3. I-save ang Bill at ang mga kaugnay na BillItems sa database gamit ang Prisma transaction
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
        status: 'pending', // Default status ng bagong gawang invoice
        generatedAt: new Date(newInvoiceData.issueDate),
        items: {
          create: newInvoiceData.lineItems.map(item => ({
            type: item.description.toLowerCase().includes('tubig') ? 'water' 
                : item.description.toLowerCase().includes('kuryente') ? 'electricity' 
                : item.description.toLowerCase().includes('internet') ? 'internet' : 'amenities',
            unitLabel: item.description,
            amount: item.amount,
            ratePerUnit: item.amount, // Maaaring i-adjust depende sa sub-meter kung kinakailangan
          })),
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

    revalidatePath("/admin/billings");
    return { success: true };
  } catch (error) {
    console.error("Error marking invoice as paid in DB:", error);
    return { success: false, error: "Nabigong i-update ang status ng invoice." };
  }
}

export async function getOccupiedRoomsForBilling() {
  try {
    // Kunin ang mga active leases kasama ang room, unit, at tenant details batay sa iyong schema
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
      },
    });

    // I-format ang data para sa frontend modal dropdown
    const roomsWithTenants = activeLeases.map((lease) => ({
      roomId: lease.room.id,
      roomNumber: lease.room.roomNumber,
      unitName: lease.room.unit?.name ?? "Main Unit",
      tenantName: lease.tenant?.fullName ?? "Unknown Tenant",
      // Mas mainam na gamitin ang lease monthlyRent, o i-fallback sa room monthlyRent kung kinakailangan
      monthlyRent: Number(lease.monthlyRent ?? lease.room.monthlyRent ?? 0),
    }));

    return { success: true, roomsWithTenants };
  } catch (error) {
    console.error("Error fetching occupied rooms:", error);
    return { success: false, roomsWithTenants: [], error: "Nabigong kunin ang mga occupied rooms." };
  }
}