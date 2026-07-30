/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from '@/src/lib/prisma'
import { Invoice } from "@/src/types/admin/billing"
import { revalidatePath } from "next/cache"
import { cookies } from 'next/headers'
import { createAuditLog } from '@/src/actions/audit-actions'
import { detectCarrier } from '@/src/utils/carrierDetector';
import { apiFetch } from "@/src/lib/api";
import { calculateTenantDueDate } from "@/src/utils/calculateDueDate";

export async function getBillingsData() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('session_user_id')?.value;

    if (!adminId) {
      return { success: true, invoices: [] };
    }

    // 1. Kunin muna ang mga tenant ID sa ilalim ng landlord na ito
    const landlordTenants = await prisma.tenant.findMany({
      where: { userId: adminId },
      select: { id: true },
    });
    const tenantIds = landlordTenants.map((t) => t.id);

    if (tenantIds.length === 0) {
      return { success: true, invoices: [] };
    }

    // 2. Kunin lamang ang mga bill na pag-aari ng mga tenant ng landlord na ito
    const dbBills = await prisma.bill.findMany({
      where: {
        tenantId: { in: tenantIds },
      },
      include: {
        tenant: {
          select: {
            fullName: true,
            leases: {
              where: { status: "active" },
              include: {
                room: { include: { unit: true } },
                unit: true, // 👈 Isinama ang unit sakaling unit-level lease ito
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

      // 💡 Suriin kung room-level o unit-level ang lease para sa tamang pag-display ng lokasyon
      let unitRoomText = "N/A";
      if (activeLease?.room) {
        const roomNumber = activeLease.room.roomNumber ?? "N/A";
        const unitName = activeLease.room.unit?.name ?? "";
        unitRoomText = unitName ? `${unitName} - Room ${roomNumber}` : `Room ${roomNumber}`;
      } else if (activeLease?.unit) {
        unitRoomText = `${activeLease.unit.name} (Buong Unit)`;
      }

      const lineItems: { description: string; amount: number }[] = [];

      let computedTotalAmount = Number(bill.rentAmount) || 0;
      if (computedTotalAmount > 0) {
        lineItems.push({ description: "Buwanang Renta", amount: computedTotalAmount });
      }

      if (activeLease?.amenities && activeLease.amenities.length > 0) {
        activeLease.amenities.forEach((leaseAmenity) => {
          const amenityAmount = Number(leaseAmenity.amount);
          if (amenityAmount > 0) {
            computedTotalAmount += amenityAmount;
            lineItems.push({
              description: `Amenity: ${leaseAmenity.amenity.name}${leaseAmenity.amenity.frequency ? ` (${leaseAmenity.amenity.frequency})` : ""}`,
              amount: amenityAmount,
            });
          }
        });
      } else if (Number(bill.amenitiesFee) > 0) {
        const fallbackAmenities = Number(bill.amenitiesFee);
        computedTotalAmount += fallbackAmenities;
        lineItems.push({ description: "Amenities Fee", amount: fallbackAmenities });
      }

      if (bill.items && bill.items.length > 0) {
        bill.items.forEach((item) => {
          const itemAmount = Number(item.amount);
          const isUtility = item.type === "electricity" || item.type === "water";
          const isApproved = item.status === "approved";

          if (itemAmount > 0 && item.type) {
            if (!isUtility && item.type !== "other") {
              computedTotalAmount += itemAmount;
              lineItems.push({
                description: `${item.type.toUpperCase()} (${item.currentReading ? `Reading: ${item.currentReading}` : 'Item'})`,
                amount: itemAmount,
              });
            } else if (isUtility && isApproved) {
              computedTotalAmount += itemAmount;
              lineItems.push({
                description: `${item.type.toUpperCase()} (Reading: ${item.currentReading ?? 'N/A'})`,
                amount: itemAmount,
              });
            }
          }
        });
      } else if (Number(bill.utilityAmount) > 0) {
        const utilityAmt = Number(bill.utilityAmount);
        computedTotalAmount += utilityAmt;
        lineItems.push({ description: "Kuryente / Tubig Utilities", amount: utilityAmt });
      }

      let status: Invoice["status"] = "Draft";
      if (bill.status === "paid") {
        status = "Paid";
      } else if (bill.status === "overdue") {
        status = "Overdue";
      } else if (bill.status === "payment_submitted" || bill.status === "pending" || (bill.payments && bill.payments.length > 0)) {
        status = "Pending";
      }

      const latestPayment = bill.payments[0];

      return {
        id: bill.id,
        invoiceNumber: `INV-${bill.id.slice(0, 8).toUpperCase()}`,
        tenantName: bill.tenant?.fullName ?? "Unknown Tenant",
        unitRoom: unitRoomText,
        issueDate: bill.generatedAt.toISOString().split("T")[0],
        dueDate: bill.dueDate.toISOString().split("T")[0],
        lineItems,
        totalAmount: computedTotalAmount,
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
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    const landlordUser = await prisma.user.findUnique({
      where: { id: adminId },
      select: { fullName: true, email: true },
    });
    const landlordName = landlordUser?.fullName || "Landlord";

    // 1. Hanapin ang tenant na kabilang LAMANG sa landlord na ito at may active lease
    const tenant = await prisma.tenant.findFirst({
      where: {
        userId: adminId,
        fullName: {
          contains: newInvoiceData.tenantName,
          mode: 'insensitive',
        },
      },
      include: {
        leases: {
          where: { status: 'active' },
          include: { room: true, unit: true },
          take: 1,
        },
      },
    });

    if (!tenant || tenant.leases.length === 0) {
      return {
        success: false,
        error: `Hindi mahanap ang aktibong lease para sa tenant na si "${newInvoiceData.tenantName}" sa iyong mga property.`
      };
    }

    const activeLease = tenant.leases[0];
    const billingMonthYear = newInvoiceData.issueDate.slice(0, 7);

    // 💡 2. I-check muna kung mayroon nang bill ang lease na ito ngayong buwan
    const existingBill = await prisma.bill.findFirst({
      where: {
        leaseId: activeLease.id,
        billingMonthYear: billingMonthYear,
      },
    });

    if (existingBill) {
      return {
        success: false,
        error: `Mayroon na palang bill ang tenant na ito para sa buwan ng ${billingMonthYear}. Hindi maaaring magkaroon ng dobleng bill sa iisang buwan.`
      };
    }

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

    const locationDescription = activeLease.roomId ? `Room ID: ${activeLease.roomId}` : `Unit ID: ${activeLease.unitId}`;

    await createAuditLog({
      actorId: adminId,
      action: `Gumawa ng bagong invoice para sa tenant: ${tenant.fullName}, ${locationDescription}, Halaga: ${newInvoiceData.totalAmount}`,
      entityType: 'Billing',
      entityId: adminId,
      metadata: { actionType: 'ADD' },
    });

    const newBill = await prisma.bill.create({
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

            let itemType: "electricity" | "water" | "amenities" | "other" = "other";
            if (desc.includes('tubig') || desc.includes('water')) {
              itemType = 'water';
            } else if (desc.includes('kuryente') || desc.includes('electric')) {
              itemType = 'electricity';
            } else if (desc.includes('rent') || desc.includes('renta')) {
              itemType = 'other';
            } else {
              itemType = 'amenities';
            }

            return {
              type: itemType,
              unitLabel: item.description,
              amount: item.amount,
              ratePerUnit: item.amount,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    // --- 💡 3. Kusa nitong i-a-update ang paymentStatus ng Lease sa 'pending' (o 'draft') kapag gumawa ng bill ---
    await prisma.lease.update({
      where: { id: activeLease.id },
      data: { paymentStatus: 'pending' },
    });

    // --- PAGPAPADALA NG NOTIFICATIONS ---
    const tenantEmail = tenant.email;
    const tenantPhone = tenant.phone;
    const tenantName = tenant.fullName;
    const formattedDueDate = new Date(newInvoiceData.dueDate).toLocaleDateString('fil-PH', { year: 'numeric', month: 'long', day: 'numeric' });

    // Token para sa API authentication
    const apiToken = process.env.NEXT_PUBLIC_API_SECRET_TOKEN;

    if (tenantEmail) {
      try {
        await apiFetch("/notify/bill", {
          method: "POST",
          body: {
            tenantName: tenantName,
            tenantEmail: tenantEmail,
            landlordName: landlordName,
            dueDate: formattedDueDate,
            totalAmount: newInvoiceData.totalAmount,
            invoiceNumber: newBill.id,
            billItems: newBill.items.map(item => ({ type: item.unitLabel, amount: item.amount }))
          },
          token: apiToken,
        });

        await apiFetch("/notify/reading-request", {
          method: "POST",
          body: {
            tenantName: tenantName,
            tenantEmail: tenantEmail,
            landlordName: landlordName,
            invoiceNumber: newBill.id,
            dueDate: formattedDueDate,
            utilityType: "Kuryente at Tubig",
          },
          token: apiToken,
        });
      } catch (emailErr) {
        console.error(`Error sa pagpapadala ng email kay ${tenantEmail}:`, emailErr);
      }
    }

    if (tenantPhone) {
      try {
        const smsMessage = `Paupahan: Bagong bill (${newBill.id}) na nagkakahalaga ng ₱${newInvoiceData.totalAmount.toLocaleString()} ang nilikha. Mag-log in at i-submit ang reading. Due: ${formattedDueDate}`;
        const detectedCarrier = detectCarrier(tenantPhone);

        await apiFetch("/notify/sms", {
          method: "POST",
          body: {
            phoneNumber: tenantPhone,
            carrier: detectedCarrier,
            message: smsMessage,
          },
          token: apiToken,
        });
      } catch (smsErr) {
        console.error(`Error sa pagpapadala ng SMS kay ${tenantPhone}:`, smsErr);
      }
    }

    revalidatePath("/admin/billings");
    return { success: true };
  } catch (error) {
    console.error("Error creating invoice in DB:", error);
    return { success: false, error: "Nabigong i-save ang bagong invoice sa database." };
  }
}

export async function markInvoiceAsPaidAction(id: string) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    const landlordUser = await prisma.user.findUnique({
      where: { id: adminId },
      select: { fullName: true },
    });
    const landlordName = landlordUser?.fullName || "Landlord";

    const landlordTenants = await prisma.tenant.findMany({
      where: { userId: adminId },
      select: { id: true },
    });
    const tenantIds = landlordTenants.map((t) => t.id);

    const billCheck = await prisma.bill.findFirst({
      where: {
        id,
        tenantId: { in: tenantIds },
      },
      include: {
        tenant: { select: { fullName: true, email: true, phone: true } },
      },
    });

    if (!billCheck) {
      return { success: false, error: "Hindi natagpuan ang invoice o wala kang pahintulot dito." };
    }

    const updatedBill = await prisma.bill.update({
      where: { id },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });

    // --- 💡 I-update ang paymentStatus ng Lease sa 'paid' kapag nabayaran na ang bill ---
    if (updatedBill.leaseId) {
      await prisma.lease.update({
        where: { id: updatedBill.leaseId },
        data: { paymentStatus: 'paid' },
      });
    }

    await createAuditLog({
      actorId: adminId,
      action: `Minarkahan bilang bayad ang invoice ID: ${id}`,
      entityType: 'Billing',
      entityId: adminId,
      metadata: { actionType: 'ADD' },
    });

    const tenantEmail = billCheck.tenant.email;
    const tenantPhone = billCheck.tenant.phone;
    const tenantName = billCheck.tenant.fullName;
    const totalAmount = Number(updatedBill.totalAmount);
    const formattedDate = new Date().toLocaleDateString('fil-PH', { year: 'numeric', month: 'long', day: 'numeric' });

    // Token para sa API authentication
    const apiToken = process.env.NEXT_PUBLIC_API_SECRET_TOKEN;

    if (tenantEmail) {
      try {
        await apiFetch("/notify/confirmation", {
          method: "POST",
          body: {
            tenantName: tenantName,
            tenantEmail: tenantEmail,
            landlordName: landlordName,
            amountPaid: totalAmount,
            paymentDate: formattedDate,
            invoiceNumber: updatedBill.id,
            notes: "Na-verify at tinanggap na ang iyong pagbabayad. Maraming salamat!",
          },
          token: apiToken,
        });
      } catch (emailErr) {
        console.error(`Error sa pagpapadala ng payment confirmation email kay ${tenantEmail}:`, emailErr);
      }
    }

    if (tenantPhone) {
      try {
        const smsMessage = `Paupahan: Tanggap na ang iyong bayad para sa invoice (${updatedBill.id}) na nagkakahalaga ng ₱${totalAmount.toLocaleString()}. Maraming salamat!`;
        const detectedCarrier = detectCarrier(tenantPhone);

        await apiFetch("/notify/sms", {
          method: "POST",
          body: {
            phoneNumber: tenantPhone,
            carrier: detectedCarrier,
            message: smsMessage,
          },
          token: apiToken,
        });
      } catch (smsErr) {
        console.error(`Error sa pagpapadala ng SMS kay ${tenantPhone}:`, smsErr);
      }
    }

    revalidatePath("/admin/billings");
    return { success: true };
  } catch (error) {
    console.error("Error marking invoice as paid in DB:", error);
    return { success: false, error: "Nabigong i-update ang status ng invoice." };
  }
}

export async function getOccupiedRoomsForBilling() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, roomsWithTenants: [], error: "Walang active session." };
    }

    const landlordTenants = await prisma.tenant.findMany({
      where: { userId: adminId },
      select: { id: true },
    });
    const tenantIds = landlordTenants.map((t) => t.id);

    if (tenantIds.length === 0) {
      return { success: true, roomsWithTenants: [] };
    }

    // 💡 1. Kunin ang lahat ng active leases (sumusuporta sa room-level at unit-level)
    const activeLeases = await prisma.lease.findMany({
      where: {
        status: "active",
        tenantId: { in: tenantIds },
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
        unit: {
          select: {
            name: true,
            monthlyRent: true,
          },
        },
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

    const roomsWithTenants = activeLeases.map((lease) => {
      const formattedAmenities = lease.amenities.map((item) => ({
        id: item.amenityId,
        name: item.amenity.name,
        amount: Number(item.amount ?? 0),
        frequency: item.amenity.frequency ?? "Buwanan",
      }));

      // 💡 Kalkulahin ang monthly rent kung ito ba ay galing sa Room o Unit
      const monthlyRent = Number(
        lease.monthlyRent ??
        lease.room?.monthlyRent ??
        lease.unit?.monthlyRent ??
        0
      );

      return {
        leaseId: lease.id,
        roomId: lease.roomId ?? null,
        unitId: lease.unitId ?? null,
        roomNumber: lease.room?.roomNumber ?? "Buong Unit",
        unitName: lease.room?.unit?.name ?? lease.unit?.name ?? "Main Unit",
        tenantName: lease.tenant?.fullName ?? "Unknown Tenant",
        monthlyRent: monthlyRent,
        amenities: formattedAmenities,

        // 👈 IDINAGDAG ITO: Ipasa ang startDate at movedInDate para mabasa ng due date utility!
        startDate: lease.startDate ?? null,
        movedInDate: lease.startDate ?? null,
      };
    });

    return { success: true, roomsWithTenants };
  } catch (error) {
    console.error("Error fetching occupied rooms/units with lease amenities:", error);
    return { success: false, roomsWithTenants: [], error: "Nabigong kunin ang mga occupied units/rooms." };
  }
}

export async function runAutoBillingForLandlord(adminId: string) {
  try {
    console.log("-----------------------------------------");
    console.log("1. Tumatakbo ang auto-billing para sa adminId:", adminId);

    const landlordTenants = await prisma.tenant.findMany({
      where: { userId: adminId },
      select: { id: true, fullName: true, email: true, phone: true },
    });

    if (landlordTenants.length === 0) {
      console.log("--> HUMINTO: Walang tenants sa ilalim ng landlord na ito.");
      return;
    }

    const tenantIds = landlordTenants.map((t) => t.id);

    const landlordUser = await prisma.user.findUnique({
      where: { id: adminId },
      select: { fullName: true, email: true },
    });
    const landlordName = landlordUser?.fullName || "Landlord";

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const billingMonthYear = `${currentYear}-${currentMonth}`;

    const activeLeases = await prisma.lease.findMany({
      where: {
        status: "active",
        tenantId: { in: tenantIds },
      },
      include: {
        tenant: { select: { fullName: true, email: true, phone: true } },
        room: { include: { unit: { select: { name: true } } } },
        unit: { select: { name: true, monthlyRent: true } },
        amenities: {
          include: {
            amenity: { select: { name: true, frequency: true } },
          },
        },
      },
    });

    if (activeLeases.length === 0) {
      console.log("--> HUMINTO: Walang active lease na nahanap para sa mga tenants na ito.");
      return;
    }

    for (const lease of activeLeases) {
      const existingBill = await prisma.bill.findFirst({
        where: {
          leaseId: lease.id,
          billingMonthYear: billingMonthYear,
        },
      });

      if (existingBill) {
        continue;
      }

      // 💡 Kunin ang buwanang renta base sa lease, room, o unit
      const monthlyRent = Number(
        lease.monthlyRent ??
        lease.room?.monthlyRent ??
        lease.unit?.monthlyRent ??
        0
      );
      let totalAmount = monthlyRent;

      const lineItemsData: { type: "electricity" | "water" | "other" | "amenities"; unitLabel: string; amount: number; ratePerUnit: number }[] = [];

      if (monthlyRent > 0) {
        lineItemsData.push({
          type: "other",
          unitLabel: "Buwanang Renta",
          amount: monthlyRent,
          ratePerUnit: monthlyRent,
        });
      }

      let amenitiesFeeTotal = 0;
      if (lease.amenities && lease.amenities.length > 0) {
        lease.amenities.forEach((leaseAmenity) => {
          const amenityAmount = Number(leaseAmenity.amount);
          if (amenityAmount > 0) {
            amenitiesFeeTotal += amenityAmount;

            lineItemsData.push({
              type: "amenities",
              unitLabel: `Amenity: ${leaseAmenity.amenity.name}${leaseAmenity.amenity.frequency ? ` (${leaseAmenity.amenity.frequency})` : ""}`,
              amount: amenityAmount,
              ratePerUnit: amenityAmount,
            });
          }
        });
      }

      totalAmount = monthlyRent + amenitiesFeeTotal;

      // ✨ GINAMIT NA ANG UTILITY: Kinukuha nito ang tamang due date string (YYYY-MM-DD)
      const computedDueDateStr = calculateTenantDueDate({
        startDate: lease.startDate,
        movedInDate: lease.startDate,
        dueDate: (lease as any).dueDate,
        dueDay: (lease as any).dueDay,
      });

      // I-convert ang YYYY-MM-DD string pabalik sa Date object na may dulo ng araw (23:59:59) para sa Prisma database
      const dueDate = new Date(`${computedDueDateStr}T23:59:59`);

      const newBill = await prisma.bill.create({
        data: {
          leaseId: lease.id,
          tenantId: lease.tenantId,
          billingMonthYear: billingMonthYear,
          dueDate: dueDate,
          rentAmount: monthlyRent,
          amenitiesFee: amenitiesFeeTotal,
          utilityAmount: 0,
          totalAmount: totalAmount,
          status: 'draft',
          generatedAt: new Date(),
          items: {
            create: lineItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // --- 💡 I-update ang paymentStatus ng Lease sa 'pending' kapag nabuo na ang awtomatikong bill ---
      await prisma.lease.update({
        where: { id: lease.id },
        data: { paymentStatus: 'pending' },
      });

      const tenantEmail = lease.tenant.email;
      const tenantPhone = lease.tenant.phone;
      const tenantName = lease.tenant.fullName;
      const formattedDueDate = dueDate.toLocaleDateString('fil-PH', { year: 'numeric', month: 'long', day: 'numeric' });

      // Token para sa API authentication
      const apiToken = process.env.NEXT_PUBLIC_API_SECRET_TOKEN;

      if (tenantEmail) {
        try {
          // Gamit ang apiFetch para sa notify/bill
          await apiFetch("/notify/bill", {
            method: "POST",
            body: {
              tenantName: tenantName,
              tenantEmail: tenantEmail,
              landlordName: landlordName,
              dueDate: formattedDueDate,
              totalAmount: totalAmount,
              invoiceNumber: newBill.id,
              billItems: newBill.items.map(item => ({ type: item.unitLabel, amount: item.amount }))
            },
            token: apiToken,
          });

          // Gamit ang apiFetch para sa notify/reading-request
          await apiFetch("/notify/reading-request", {
            method: "POST",
            body: {
              tenantName: tenantName,
              tenantEmail: tenantEmail,
              landlordName: landlordName,
              invoiceNumber: newBill.id,
              dueDate: formattedDueDate,
              utilityType: "Kuryente at Tubig",
            },
            token: apiToken,
          });
        } catch (emailErr) {
          console.error(`Error sa pagpapadala ng emails kay ${tenantEmail}:`, emailErr);
        }
      }

      if (tenantPhone) {
        try {
          const smsMessage = `Paupahan: Nabuo na ang draft bill (${newBill.id}) na nagkakahalaga ng ₱${totalAmount.toLocaleString()}. Mangyaring mag-log in at i-submit ang iyong meter reading. Due: ${formattedDueDate}`;
          const detectedCarrier = detectCarrier(tenantPhone);

          // Gamit ang apiFetch para sa notify/sms
          await apiFetch("/notify/sms", {
            method: "POST",
            body: {
              phoneNumber: tenantPhone,
              carrier: detectedCarrier,
              message: smsMessage,
            },
            token: apiToken,
          });
        } catch (smsErr) {
          console.error(`Error sa pagpapadala ng SMS kay ${tenantPhone}:`, smsErr);
        }
      }
    }
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("Error sa auto-billing process:", error);
  }
}

export async function sendBillingReminderAction(invoiceId: string, tenantName: string, reminderNote: string = "") {
  try {
    // 1. Kunin ang mga detalye ng bill, tenant, at landlord mula sa database
    const bill = await prisma.bill.findUnique({
      where: { id: invoiceId },
      include: {
        tenant: {
          select: {
            fullName: true,
            email: true,
          },
        },
        lease: {
          include: {
            room: {
              include: {
                unit: {
                  include: {
                    property: {
                      include: {
                        landlord: {
                          select: {
                            fullName: true,
                          },
                        },
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
                    landlord: {
                      select: {
                        fullName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        items: true,
      },
    });

    if (!bill || !bill.tenant) {
      return { success: false, error: "Hindi natagpuan ang detalye ng bill o tenant." };
    }

    // 2. Kunin ang Landlord Name mula sa room lease o unit lease
    const landlordName =
      bill.lease?.room?.unit?.property?.landlord?.fullName ||
      bill.lease?.unit?.property?.landlord?.fullName ||
      "Landlord";

    // 3. Kalkulahin o kunin ang total amount
    let totalAmount = Number(bill.rentAmount) || 0;
    totalAmount += Number(bill.amenitiesFee) || 0;
    totalAmount += Number(bill.utilityAmount) || 0;
    if (bill.items && bill.items.length > 0) {
      bill.items.forEach(item => {
        totalAmount += Number(item.amount) || 0;
      });
    }

    const tenantEmail = bill.tenant.email || "";
    const formattedInvoiceNumber = `INV-${bill.id.slice(0, 8).toUpperCase()}`;
    const dueDateFormatted = bill.dueDate.toISOString().split("T")[0];

    // 4. Tawagin ang backend endpoint gamit ang apiFetch wrapper
    await apiFetch("/notify/reminder", {
      method: "POST",
      body: {
        tenantName: bill.tenant.fullName,
        tenantEmail: tenantEmail,
        landlordName: landlordName,
        dueDate: dueDateFormatted,
        totalAmount: totalAmount,
        invoiceNumber: formattedInvoiceNumber,
        reminderNote: reminderNote,
      },
      // Opsyonal: Kung gumagamit ka ng token mula sa environment variable o cookies
      token: process.env.NEXT_PUBLIC_API_SECRET_TOKEN,
    });

    return { success: true, message: `Matagumpay na naipadala ang paalala kay ${tenantName}.` };
  } catch (error) {
    console.error("Error sending billing reminder:", error);
    return { success: false, error: "Nabigong magpadala ng paalala sa tenant." };
  }
}