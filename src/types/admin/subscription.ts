export type PlanTier = 
  | "Panimula" 
  | "Bahay-Upa" 
  | "Maalam" 
  | "Negosyante" 
  | "Ayon sa'yo";

export interface SubscriptionPlan {
  id: string;
  tag: string;
  name: PlanTier;
  tagline: string;
  priceMonthly: number; // Numeric value para sa madaling pagkalkula
  priceDisplay: string; // Halimbawa: "₱0", "₱399", o "Custom"
  per: string; // Halimbawa: "/buwan" o ""
  note: string;
  maxUnits: string;
  features: string[]; // Ginagamit para sa perks
  missing?: string[]; // Mga feature na wala sa planong ito
  isPopular?: boolean;
  badge?: string | null;
  cta: string;
  ctaVariant?: "primary" | "ghost";
}

export interface CurrentSubscription {
  planName: PlanTier;
  status: "Active" | "Past Due" | "Trialing";
  renewsOn: string;
  paymentMethod: string;
  unitsUsed: number;
  maxUnitsLimit: number;
}