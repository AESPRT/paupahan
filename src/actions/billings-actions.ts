/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from '@/src/lib/prisma'
import { Invoice } from "@/src/types/admin/billing"
import { revalidatePath } from "next/cache"
import { cookies } from 'next/headers'
import { createAuditLog } from '@/src/actions/audit-actions'
import axios from 'axios';
import { detectCarrier } from '@/src/utils/carrierDetector';

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
            if (!isUtility) {
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

    // 💡 2. I-check muna kung may existing bill na ang lease na ito ngayong buwan
    const existingBill = await prisma.bill.findFirst({
      where: {
        leaseId: activeLease.id,
        billingMonthYear: billingMonthYear,
      },
    });

    if (existingBill) {
      return { 
        success: false, 
        error: `Mayroon na palang bill ang tenant na ito para sa buwan ng ${billingMonthYear}. Hindi maaaring magkaroon ng dobleng bill sa ihong buwan.` 
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
    
    await createAuditLog({
      actorId: adminId,
      action: `Gumawa ng bagong invoice para sa tenant: ${tenant.fullName}, Room: ${activeLease.roomId}, Halaga: ${newInvoiceData.totalAmount}`,
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
            } else if (desc.includes('utilities') || desc.includes('wifi')) {
              itemType = 'amenities';
            }

            return {
              type: itemType,
              unitLabel: item.description,
              amount: desc.includes('rent') || desc.includes('renta') ? 0 : item.amount,
              ratePerUnit: item.amount,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    // --- PAGPAPADALA NG NOTIFICATIONS (EMAILS & SMS GAMIT ANG AXIOS) ---
    const tenantEmail = tenant.email;
    const tenantPhone = tenant.phone;
    const tenantName = tenant.fullName;
    const formattedDueDate = new Date(newInvoiceData.dueDate).toLocaleDateString('fil-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

    if (tenantEmail) {
      try {
        await axios.post(`${API_BASE_URL}/notify/bill`, {
          tenantName: tenantName,
          tenantEmail: tenantEmail,
          landlordName: landlordName,
          dueDate: formattedDueDate,
          totalAmount: newInvoiceData.totalAmount,
          invoiceNumber: newBill.id,
          billItems: newBill.items.map(item => ({ type: item.unitLabel, amount: item.amount }))
        }, {
          headers: {
            Authorization: `Bearer ${process.env.API_SECRET_TOKEN}` // O kaya ay galing sa public env kung client-side
          }
        });

        await axios.post(`${API_BASE_URL}/notify/reading-request`, {
          tenantName: tenantName,
          tenantEmail: tenantEmail,
          landlordName: landlordName,
          invoiceNumber: newBill.id,
          dueDate: formattedDueDate,
          utilityType: "Kuryente at Tubig",
        }, {
          headers: {
            Authorization: `Bearer ${process.env.API_SECRET_TOKEN}` // O kaya ay galing sa public env kung client-side
          }
        });
      } catch (emailErr) {
        console.error(`Error sa pagpapadala ng email kay ${tenantEmail}:`, emailErr);
      }
    }

    if (tenantPhone) {
      try {
        const smsMessage = `Paupahan: Bagong bill (${newBill.id}) na nagkakahalaga ng ₱${newInvoiceData.totalAmount.toLocaleString()} ang nilikha. Mag-log in at i-submit ang reading. Due: ${formattedDueDate}`;
        const detectedCarrier = detectCarrier(tenantPhone);

        await axios.post(`${API_BASE_URL}/notify/sms`, {
          phoneNumber: tenantPhone,
          carrier: detectedCarrier,
          message: smsMessage,
        }, {
          headers: {
            Authorization: `Bearer ${process.env.API_SECRET_TOKEN}` // O kaya ay galing sa public env kung client-side
          }
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

    // Kunin ang pangalan ng Landlord para sa email context (ginamit ang fullName)
    const landlordUser = await prisma.user.findUnique({
      where: { id: adminId },
      select: { fullName: true },
    });
    const landlordName = landlordUser?.fullName || "Landlord";

    // 1. Seguridad: Siguraduhing ang bill ay pagmamay-ari ng tenant na nasa ilalim ng landlord na ito
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
    
    await createAuditLog({
      actorId: adminId,
      action: `Minarkahan bilang bayad ang invoice ID: ${id}`,
      entityType: 'Billing',
      entityId: adminId,
      metadata: { actionType: 'ADD' },
    });

    // --- PAGPAPADALA NG PAYMENT CONFIRMATION (EMAIL & SMS GAMIT ANG AXIOS) ---
    const tenantEmail = billCheck.tenant.email;
    const tenantPhone = billCheck.tenant.phone;
    const tenantName = billCheck.tenant.fullName;
    const totalAmount = Number(updatedBill.totalAmount);
    const formattedDate = new Date().toLocaleDateString('fil-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

    if (tenantEmail) {
      try {
        await axios.post(`${API_BASE_URL}/notify/confirmation`, {
          tenantName: tenantName,
          tenantEmail: tenantEmail,
          landlordName: landlordName,
          amountPaid: totalAmount,
          paymentDate: formattedDate,
          invoiceNumber: updatedBill.id,
          notes: "Na-verify at tinanggap na ang iyong pagbabayad. Maraming salamat!",
        }, {
          headers: {
            Authorization: `Bearer ${process.env.API_SECRET_TOKEN}` // O kaya ay galing sa public env kung client-side
          }
        });
      } catch (emailErr) {
        console.error(`Error sa pagpapadala ng payment confirmation email kay ${tenantEmail}:`, emailErr);
      }
    }

    if (tenantPhone) {
      try {
        const smsMessage = `Paupahan: Tanggap na ang iyong bayad para sa invoice (${updatedBill.id}) na nagkakahalaga ng ₱${totalAmount.toLocaleString()}. Maraming salamat!`;
        const detectedCarrier = detectCarrier(tenantPhone);

        await axios.post(`${API_BASE_URL}/notify/sms`, {
          phoneNumber: tenantPhone,
          carrier: detectedCarrier,
          message: smsMessage,
        }, {
          headers: {
            Authorization: `Bearer ${process.env.API_SECRET_TOKEN}` // O kaya ay galing sa public env kung client-side
          }
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

    // 1. Kunin ang mga tenant ID ng landlord na ito
    const landlordTenants = await prisma.tenant.findMany({
      where: { userId: adminId },
      select: { id: true },
    });
    const tenantIds = landlordTenants.map((t) => t.id);

    if (tenantIds.length === 0) {
      return { success: true, roomsWithTenants: [] };
    }

    // 2. Kunin lamang ang mga active lease na naka-attach sa mga tenant ng landlord na ito
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

      return {
        leaseId: lease.id,
        roomId: lease.room.id,
        roomNumber: lease.room.roomNumber,
        unitName: lease.room.unit?.name ?? "Main Unit",
        tenantName: lease.tenant?.fullName ?? "Unknown Tenant",
        monthlyRent: Number(lease.monthlyRent ?? lease.room.monthlyRent ?? 0),
        amenities: formattedAmenities,
      };
    });

    return { success: true, roomsWithTenants };
  } catch (error) {
    console.error("Error fetching occupied rooms with lease amenities:", error);
    return { success: false, roomsWithTenants: [], error: "Nabigong kunin ang mga occupied rooms." };
  }
}

export async function runAutoBillingForLandlord(adminId: string) {
  try {
    console.log("-----------------------------------------");
    console.log("1. Tumatakbo ang auto-billing para sa adminId:", adminId);

    // 1. Kunin ang mga tenant ID sa ilalim ng landlord na ito
    const landlordTenants = await prisma.tenant.findMany({
      where: { userId: adminId },
      select: { id: true, fullName: true, email: true, phone: true },
    });
    console.log("2. Bilang ng nahanap na tenants:", landlordTenants.length);
    
    if (landlordTenants.length === 0) {
      console.log("--> HUMINTO: Walang tenants sa ilalim ng landlord na ito.");
      return;
    }

    const tenantIds = landlordTenants.map((t) => t.id);

    // Kunin ang pangalan ng Landlord para sa email/SMS context (ginamit ang fullName)
    const landlordUser = await prisma.user.findUnique({
      where: { id: adminId },
      select: { fullName: true, email: true },
    });
    const landlordName = landlordUser?.fullName || "Landlord";

    // 2. Kunin ang kasalukuyang buwan at taon (Format: "YYYY-MM")
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const billingMonthYear = `${currentYear}-${currentMonth}`;
    console.log("3. Kasalukuyang billingMonthYear:", billingMonthYear);

    // 3. Kunin lahat ng active leases ng mga tenant na ito
    const activeLeases = await prisma.lease.findMany({
      where: {
        status: "active",
        tenantId: { in: tenantIds },
      },
      include: {
        tenant: { select: { fullName: true, email: true, phone: true } },
        room: { include: { unit: { select: { name: true } } } },
        amenities: {
          include: {
            amenity: { select: { name: true, frequency: true } },
          },
        },
      },
    });
    console.log("4. Bilang ng nahanap na active leases:", activeLeases.length);

    if (activeLeases.length === 0) {
      console.log("--> HUMINTO: Walang active lease na nahanap para sa mga tenants na ito.");
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

    for (const lease of activeLeases) {
      console.log(`5. Sinusuri ang lease ID: ${lease.id} para sa tenant: ${lease.tenant.fullName}`);

      // 4. Suriin kung mayroon nang bill ang lease na ito para sa kasalukuyang buwan
      const existingBill = await prisma.bill.findFirst({
        where: {
          leaseId: lease.id,
          billingMonthYear: billingMonthYear,
        },
      });

      if (existingBill) {
        console.log(`--> LALAMPASAN: Mayroon na palang bill ang lease ID: ${lease.id} ngayong ${billingMonthYear}`);
        continue;
      }

      console.log(`6. Gagawa na ng bill para sa lease ID: ${lease.id}...`);

      const monthlyRent = Number(lease.monthlyRent ?? lease.room.monthlyRent ?? 0);
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

      // 5. Kunin ang araw mula sa lease.startDate para maging due date bawat buwan
      const leaseStartDate = new Date(lease.startDate);
      const startDay = leaseStartDate.getDate();
      const dueDate = new Date(currentYear, Number(currentMonth) - 1, startDay, 23, 59, 59);

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

      console.log(`7. TAGUMPAY! Nalikha na ang bill ID: ${newBill.id} na may Due Date na: ${dueDate.toISOString()}`);

      // --- PAGPAPADALA NG NOTIFICATIONS (EMAILS & SMS GAMIT ANG AXIOS) ---
      const tenantEmail = lease.tenant.email;
      const tenantPhone = lease.tenant.phone;
      const tenantName = lease.tenant.fullName;
      const formattedDueDate = dueDate.toLocaleDateString('fil-PH', { year: 'numeric', month: 'long', day: 'numeric' });

      if (tenantEmail) {
        try {
          // 1. Ipadala ang unang email: Bill / Invoice Notification (`/notify/bill`)
          await axios.post(`${API_BASE_URL}/notify/bill`, {
            tenantName: tenantName,
            tenantEmail: tenantEmail,
            landlordName: landlordName,
            dueDate: formattedDueDate,
            totalAmount: totalAmount,
            invoiceNumber: newBill.id,
            billItems: newBill.items.map(item => ({ type: item.unitLabel, amount: item.amount }))
          }, {
            headers: {
              Authorization: `Bearer ${process.env.API_SECRET_TOKEN}` // O kaya ay galing sa public env kung client-side
            }
          });
          console.log(`--> Naipadala ang Bill Notification Email kay ${tenantEmail}`);

          // 2. Ipadala ang pangalawang email: Reading Request Notification (`/notify/reading-request`)
          await axios.post(`${API_BASE_URL}/notify/reading-request`, {
            tenantName: tenantName,
            tenantEmail: tenantEmail,
            landlordName: landlordName,
            invoiceNumber: newBill.id,
            dueDate: formattedDueDate,
            utilityType: "Kuryente at Tubig",
          }, {
            headers: {
              Authorization: `Bearer ${process.env.API_SECRET_TOKEN}` // O kaya ay galing sa public env kung client-side
            }
          });
          console.log(`--> Naipadala ang Reading Request Email kay ${tenantEmail}`);

        } catch (emailErr) {
          console.error(`Error sa pagpapadala ng emails kay ${tenantEmail}:`, emailErr);
        }
      }

      if (tenantPhone) {
        try {
          // 3. Ipadala ang SMS notification via Email-to-SMS gateway
          const smsMessage = `Paupahan: Nabuo na ang draft bill (${newBill.id}) na nagkakahalaga ng ₱${totalAmount.toLocaleString()}. Mangyaring mag-log in at i-submit ang iyong meter reading. Due: ${formattedDueDate}`;
          const detectedCarrier = detectCarrier(tenantPhone);

          await axios.post(`${API_BASE_URL}/notify/sms`, {
            phoneNumber: tenantPhone,
            carrier: detectedCarrier, 
            message: smsMessage,
          }, {
            headers: {
              Authorization: `Bearer ${process.env.API_SECRET_TOKEN}` // O kaya ay galing sa public env kung client-side
            }
          });
          console.log(`--> Naipadala ang SMS notification kay ${tenantPhone}`);
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