/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Helper function para sa mga headers na may kasamang Bearer Token
const getAuthHeaders = () => {
  return {
    headers: {
      Authorization: `Bearer ${process.env.API_SECRET_TOKEN || process.env.NEXT_PUBLIC_API_SECRET_TOKEN}`,
    },
  };
};

export async function createCheckoutSession(payload: CheckoutPayload): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/checkout`, payload, getAuthHeaders());
    const data = response.data;

    if (data && data.checkoutUrl) {
      return data.checkoutUrl;
    }
    throw new Error("Walang natanggap na checkout URL mula sa server.");
  } catch (err: any) {
    const errorMessage = err.response?.data?.error || err.message || "May nangyaring error sa pag-checkout.";
    throw new Error(errorMessage);
  }
}

export async function submitCustomInquiry(payload: CustomInquiryPayload): Promise<void> {
  try {
    await axios.post(`${API_BASE_URL}/custom-inquiry`, payload, getAuthHeaders());
  } catch (err: any) {
    const errorMessage = err.response?.data?.error || err.message || "Nabigong maipadala ang mensahe. Subukan muli.";
    throw new Error(errorMessage);
  }
}

export async function changeLandlordSubscription(payload: ChangePlanPayload): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/change-plan`, payload, getAuthHeaders());
    const data = response.data;

    // Kung paid plan, magbabalik ito ng checkout URL para sa PayMongo
    if (data && data.checkoutUrl) {
      return data.checkoutUrl;
    }
    // Kung libreng plan, magbabalik ito ng success indicator
    return data?.success ? "SUCCESS" : "";
  } catch (err: any) {
    const errorMessage = err.response?.data?.error || err.message || "Nabigong palitan ang plan. Subukan muli.";
    throw new Error(errorMessage);
  }
}