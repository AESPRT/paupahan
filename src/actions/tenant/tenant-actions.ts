/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
"use server";

import prisma from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { NotificationChannel, NotificationStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { apiFetch } from "@/src/lib/api"; // 👈 Gamitin ang apiFetch wrapper
import { detectCarrier } from '@/src/utils/carrierDetector';

export async function getBillDetailsForPayment(billId: string) {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        items: true,
        lease: {
          include: {
            // 1. Posibilidad A: Unit-level lease (direktang nakakonekta ang unit sa lease)
            unit: {
              include: {
                property: true,
              },
            },
            // 2. Posibilidad B: Room-level lease (nakakonekta sa room, tapos unit, tapos property)
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
        },
      },
    }) as any;

    if (!bill) {
      console.log(`[DEBUG] Bill hindi nahanap para sa ID: ${billId}`);
      return null;
    }

    // 🛠️ Kunin ang landlordId mula sa alinman sa dalawang tamang landas batay sa schema
    const landlordId = 
      bill.lease?.unit?.property?.landlordId || 
      bill.lease?.room?.unit?.property?.landlordId;

    console.log("[DEBUG] Natukoy na Landlord ID:", landlordId);

    let landlordSettings = null;

    if (landlordId) {
      const landlordUser = await prisma.user.findUnique({
        where: { id: landlordId },
        select: { paymentSettings: true },
      });

      if (landlordUser?.paymentSettings) {
        landlordSettings = landlordUser.paymentSettings;
        
        if (typeof landlordSettings === "string") {
          try {
            landlordSettings = JSON.parse(landlordSettings);
          } catch (e) {
            landlordSettings = null;
          }
        }
      }
    }

    const monthYearFormatted = bill.billingMonthYear; 
    const dueDateFormatted = new Date(bill.dueDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return {
      id: bill.id,
      tenantId: bill.tenantId,
      monthYear: monthYearFormatted,
      totalAmount: Number(bill.totalAmount),
      dueDate: dueDateFormatted,
      status: bill.status,
      landlordPaymentSettings: landlordSettings,
    };
  } catch (error) {
    console.error("Error fetching bill details for payment:", error);
    return null;
  }
}

export async function submitPaymentAction(formData: FormData) {
  try {
    const billId = formData.get("billId") as string;
    const tenantId = formData.get("tenantId") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const referenceNo = formData.get("referenceNo") as string;
    const amount = Number(formData.get("amount"));
    
    // 🛠️ Kinuha ang File mula sa FormData
    const receiptFile = formData.get("receipt") as File | null;
    let receiptUrl = formData.get("receiptUrl") as string;

    // 🛠️ I-convert ang File object patungong Base64 string dito sa Server Action
    if (receiptFile && receiptFile instanceof File && receiptFile.size > 0 && !receiptUrl) {
      const bytes = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = receiptFile.type || "image/jpeg";
      receiptUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    console.log("🔍 [DEBUG] Receipt URL length:", receiptUrl ? receiptUrl.length : "Walaang resibo");

    if (!billId || !tenantId || !amount) {
      return { success: false, error: "Kulang ang mga kinakailangang impormasyon." };
    }

    // 1. I-save ang payment record sa `payments` table
    await prisma.payment.create({
      data: {
        billId,
        tenantId,
        amount,
        paymentMethod,
        referenceNo: referenceNo || null,
        receiptUrl: receiptUrl || null,
      },
    });

    // 2. I-update ang status ng bill
    await prisma.bill.update({
      where: { id: billId },
      data: {
        status: "payment_submitted", 
        paymentReceiptUrl: receiptUrl || null,
      },
    });

    // 3. Hanapin ang Landlord User ID at detalye
    const billDetails = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        tenant: true,
        lease: {
          include: {
            room: {
              include: {
                unit: {
                  include: {
                    property: {
                      include: {
                        landlord: { select: { id: true, fullName: true, email: true, phone: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const landlord = billDetails?.lease?.room?.unit?.property?.landlord;
    const landlordId = landlord?.id;
    const landlordEmail = landlord?.email;
    const landlordPhone = landlord?.phone;
    const landlordName = landlord?.fullName || "Landlord";
    
    const tenantName = billDetails?.tenant?.fullName || "Isang tenant";
    const billingMonth = billDetails?.billingMonthYear || "buwan na ito";

    if (landlordId) {
      await prisma.notification.create({
        data: {
          recipientUserId: landlordId,
          type: "PAYMENT_SUBMITTED",
          channel: NotificationChannel.in_app,
          title: "Bagong Bayad na Isinumite",
          message: `Nagsumite ng bayad si ${tenantName} para sa billing ng ${billingMonth} gamit ang ${paymentMethod}.`,
          relatedEntityType: "Bill",
          relatedEntityId: billId,
          status: NotificationStatus.pending,
        },
      });
    }

    // --- PAGPAPADALA NG EMAIL ---
    const apiToken = process.env.NEXT_PUBLIC_API_SECRET_TOKEN;
    const formattedAmount = new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP' }).format(amount);

    if (landlordEmail) {
      try {
        await apiFetch("/notify/landlord-payment", {
          method: "POST",
          body: {
            landlordEmail: landlordEmail,
            landlordName: landlordName,
            tenantName: tenantName,
            amountPaid: amount,
            invoiceNumber: billId,
            referenceNumber: referenceNo || 'N/A',
            paymentMethod: paymentMethod,
            receiptUrl: receiptUrl || null,
          },
          token: apiToken,
        });
      } catch (emailErr) {
        console.error(`Error sa pagpapadala ng landlord payment email kay ${landlordEmail}:`, emailErr);
      }
    }

    if (landlordPhone) {
      try {
        const smsMessage = `Paupahan Alert: Nagbayad si ${tenantName} ng ${formattedAmount} para sa bill (${billId}) gamit ang ${paymentMethod}. Mag-log in para i-verify.`;
        const detectedCarrier = detectCarrier(landlordPhone);

        await apiFetch("/notify/sms", {
          method: "POST",
          body: {
            phoneNumber: landlordPhone,
            carrier: detectedCarrier,
            message: smsMessage,
          },
          token: apiToken,
        });
      } catch (smsErr) {
        console.error(`Error sa pagpapadala ng SMS kay landlord (${landlordPhone}):`, smsErr);
      }
    }

    revalidatePath(`/tenant/payment/${billId}`);
    revalidatePath(`/tenant/dashboard/home`);

    return { success: true, message: "Matagumpay na naisumite ang iyong bayad!" };
  } catch (error) {
    console.error("Error submitting payment:", error);
    return { success: false, error: "Nagkaroon ng problema sa pagproseso ng iyong bayad." };
  }
}

export async function getTenantSettingsData() {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("session_user_id")?.value;

    if (!tenantId) {
      return { success: false, error: "Walang active session." };
    }

    // Gamitin ang tenantId at i-query kasama ang leases
    const tenant = (await prisma.tenant.findUnique({
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
      },
    })) as any;

    if (!tenant) {
      return { success: false, error: "Hindi nahanap ang tenant." };
    }

    const activeLease = tenant.leases[0];
    const room = activeLease?.room;
    const unit = room?.unit;
    const property = unit?.property;

    const notifs = tenant.notificationSettings || tenant.notification_settings || {};

    const settingsData = {
      fullName: tenant.fullName || "",
      email: tenant.email || "",
      phoneNumber: tenant.phone || "",
      emergencyContactName: tenant.emergencyContactName || "",
      emergencyContactPhone: tenant.emergencyContactPhone || "",
      roomName: room ? `Room ${room.roomNumber} - ${unit?.name || ""}` : "Walang active room",
      propertyName: property?.name || "Walang assigned property",
      notifications: {
        smsAlerts: notifs.smsAlerts ?? notifs.sms_alerts ?? true,
        emailAlerts: notifs.emailAlerts ?? notifs.email_alerts ?? true,
        billingReminders: notifs.billingReminders ?? notifs.billing_reminders ?? true,
      },
    };

    return { success: true, data: settingsData };
  } catch (error) {
    console.error("Error fetching tenant settings:", error);
    return { success: false, error: "Nabigong makuha ang settings." };
  }
}

export async function updateTenantSettingsAction(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("session_user_id")?.value;

    if (!tenantId) {
      return { success: false, error: "Walang active session." };
    }

    const fullName = formData.get("fullName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const emergencyContactName = formData.get("emergencyContactName") as string;
    const emergencyContactPhone = formData.get("emergencyContactPhone") as string;
    
    const smsAlerts = formData.get("smsAlerts") === "true";
    const emailAlerts = formData.get("emailAlerts") === "true";
    const billingReminders = formData.get("billingReminders") === "true";

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        fullName,
        phone: phoneNumber,
        emergencyContactName,
        emergencyContactPhone,
        notificationSettings: {
          smsAlerts,
          emailAlerts,
          billingReminders,
        },
      } as any,
    });

    revalidatePath("/tenant/settings");
    return { success: true, message: "Matagumpay na na-update ang iyong profile!" };
  } catch (error) {
    console.error("Error updating tenant settings:", error);
    return { success: false, error: "Nabigong i-update ang profile." };
  }
}