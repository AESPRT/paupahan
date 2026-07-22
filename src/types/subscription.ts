export type PlanTier = "Free Trial" | "Starter" | "Pro Plan" | "Enterprise";

export interface SubscriptionPlan {
  id: string;
  name: PlanTier;
  priceMonthly: number;
  maxUnits: string;
  features: string[];
  isPopular?: boolean;
}

export interface CurrentSubscription {
  planName: PlanTier;
  status: "Active" | "Past Due" | "Trialing";
  renewsOn: string;
  paymentMethod: string;
  unitsUsed: number;
  maxUnitsLimit: number;
}