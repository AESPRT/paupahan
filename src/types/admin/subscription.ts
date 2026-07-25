export type PlanTier = 
  | "Panimula" 
  | "Bahay-Upa" 
  | "Maalam" 
  | "Negosyante" 
  | "Ayon sa'yo";

export interface SubscriptionPlan {
  id: string;
  tag: string;
  name: string; // o PlanTier type
  displayName: string; // o PlanTier type
  tagline: string;
  priceMonthly: number;
  priceDisplay: string;
  per: string;
  note: string;
  maxUnits: number;       // 👈 Ginawa nang number
  maxRooms: number;       // 👈 Idinagdag
  maxUnitsDisplay: string; // 👈 Para sa UI text display
  features: string[];
  missing: string[];
  isPopular: boolean;
  badge: string | null;
  cta: string;
  ctaVariant: "ghost" | "primary" | string;
}

export interface CurrentSubscription {
  userId: string;        // 👈 Idagdag ito
  userName?: string;     // 👈 Idagdag ito
  userEmail?: string;    // 👈 Idagdag ito
  userPhone?: string;    // 👈 Idagdag ito
  planName: PlanTier;
  status: "Active" | "Past Due" | "Trialing" | "Canceled";
  autoRenew: boolean;
  renewsOn: string;
  paymentMethod: string;
  paymentNumber?: string; // Idinagdag
  paymentMethodId?: string;
  unitsUsed: number;
  maxUnitsLimit: number;
  roomsUsed: number;     
  maxRoomLimit: number;  
}