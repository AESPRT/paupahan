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
  planName: PlanTier;
  status: "Active" | "Past Due" | "Trialing" | "Canceled";
  renewsOn: string;
  paymentMethod: string;
  unitsUsed: number;
  maxUnitsLimit: number;
  roomsUsed: number;     // 👈 Idagdag ito para sa real-time counter ng rooms
  maxRoomLimit: number;  // 👈 Idagdag ito para sa room limit
}