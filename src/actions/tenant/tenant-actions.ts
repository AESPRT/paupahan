/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
"use server";

import prisma from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { NotificationChannel, NotificationStatus } from "@prisma/client";
import { cookies } from "next/headers";
import axios from 'axios';
import { detectCarrier } from '@/src/utils/carrierDetector';

export async function getBillDetailsForPayment(billId: string) {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        items: true,
        lease: {
          include: {
            room: {
              include: {
                unit: {
                  include: {
                    property: true, // Kunin muna ang property para makuha ang landlordId
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!bill) {
      return null;
    }

    // Kunin ang landlordId mula sa property ng lease/room/unit
    const landlordId = bill.lease?.room?.unit?.property?.landlordId;

    let landlordSettings = null;

    if (landlordId) {
      // Direktang hanapin ang landlord sa User table gamit ang landlordId para sigurado
      const landlordUser = await prisma.user.findUnique({
        where: { id: landlordId },
        select: { paymentSettings: true },
      });

      if (landlordUser?.paymentSettings) {
        landlordSettings = landlordUser.paymentSettings;
        
        // I-parse kung sakaling string ang pagkakaseed/pagkaka-store sa database
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
    const receiptUrl = formData.get("receiptUrl") as string;

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
      },
    });

    // 2. I-update ang status ng bill at i-save ang receipt URL
    await prisma.bill.update({
      where: { id: billId },
      data: {
        status: "pending", 
        paymentReceiptUrl: receiptUrl || null,
      },
    });

    // 3. Hanapin ang Landlord User ID at detalye para mapadalhan ng notification (fullName ang ginamit sa halip na name)
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
      // 4. Gumawa ng In-App Notification para sa Landlord
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

    // --- PAGPAPADALA NG EMAIL AT SMS NOTIFICATION KAY LANDLORD (GAMIT ANG AXIOS) ---
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const formattedAmount = new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP' }).format(amount);

    if (landlordEmail) {
      try {
        await axios.post(`${API_BASE_URL}/notify/landlord-payment`, {
          landlordEmail: landlordEmail,
          landlordName: landlordName,
          tenantName: tenantName,
          amountPaid: amount,
          invoiceNumber: billId,
          referenceNumber: referenceNo || 'N/A',
          paymentMethod: paymentMethod,
        });
      } catch (emailErr) {
        console.error(`Error sa pagpapadala ng landlord payment email kay ${landlordEmail}:`, emailErr);
      }
    }

    if (landlordPhone) {
      try {
        const smsMessage = `Paupahan Alert: Nagbayad si ${tenantName} ng ${formattedAmount} para sa bill (${billId}) gamit ang ${paymentMethod}. Mag-log in para i-verify.`;
        const detectedCarrier = detectCarrier(landlordPhone);

        await axios.post(`${API_BASE_URL}/notify/sms`, {
          phoneNumber: landlordPhone,
          carrier: detectedCarrier,
          message: smsMessage,
        });
      } catch (smsErr) {
        console.error(`Error sa pagpapadala ng SMS kay landlord (${landlordPhone}):`, smsErr);
      }
    }

    // I-revalidate ang path para mag-update ang UI
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
    })) as any; // I-cast bilang any upang maiwasan ang strict TypeScript property errors

    if (!tenant) {
      return { success: false, error: "Hindi nahanap ang tenant." };
    }

    const activeLease = tenant.leases[0];
    const room = activeLease?.room;
    const unit = room?.unit;
    const property = unit?.property;

    // Sinasalo ang notification settings mapa-snake_case man o camelCase ang database column
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

// Action para i-update ang tenant profile at notifications
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

    // Gumamit ng type assertion para sa update data kung sakaling hindi pa nai-update ang Prisma Client types
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