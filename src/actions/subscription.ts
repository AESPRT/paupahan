/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "@/src/lib/api"; // 👈 Gamitin ang apiFetch wrapper

interface CheckoutPayload {
  userId: string;
  packageId: string;
  cycle: "MONTHLY" | "ANNUAL";
  cusName: string;
  cusEmail: string;
  cusPhone: string;
  successUrl: string;
  cancelUrl: string;
}

interface CustomInquiryPayload {
  name: string;
  email: string;
  message: string;
  planType: string;
}

interface ChangePlanPayload {
  userId?: string;
  planId: string;
  cycle?: "MONTHLY" | "ANNUAL";
  cusName?: string;
  cusEmail?: string;
  cusPhone?: string;
  successUrl?: string;
  cancelUrl?: string;
}

// Token para sa API authentication
const apiToken = process.env.API_SECRET_TOKEN || process.env.NEXT_PUBLIC_API_SECRET_TOKEN;

export async function createCheckoutSession(payload: CheckoutPayload): Promise<string> {
  try {
    const data: any = await apiFetch("/checkout", {
      method: "POST",
      body: payload,
      token: apiToken,
    });

    if (data && data.checkoutUrl) {
      return data.checkoutUrl;
    }
    throw new Error("Walang natanggap na checkout URL mula sa server.");
  } catch (err: any) {
    const errorMessage = err.message || "May nangyaring error sa pag-checkout.";
    throw new Error(errorMessage);
  }
}

export async function submitCustomInquiry(payload: CustomInquiryPayload): Promise<void> {
  try {
    await apiFetch("/custom-inquiry", {
      method: "POST",
      body: payload,
      token: apiToken,
    });
  } catch (err: any) {
    const errorMessage = err.message || "Nabigong maipadala ang mensahe. Subukan muli.";
    throw new Error(errorMessage);
  }
}

export async function changeLandlordSubscription(payload: ChangePlanPayload): Promise<string> {
  try {
    const data: any = await apiFetch("/change-plan", {
      method: "POST",
      body: payload,
      token: apiToken,
    });

    // Kung paid plan, magbabalik ito ng checkout URL para sa PayMongo
    if (data && data.checkoutUrl) {
      return data.checkoutUrl;
    }
    // Kung libreng plan, magbabalik ito ng success indicator
    return data?.success ? "SUCCESS" : "";
  } catch (err: any) {
    const errorMessage = err.message || "Nabigong palitan ang plan. Subukan muli.";
    throw new Error(errorMessage);
  }
}