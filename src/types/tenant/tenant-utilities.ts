export interface UtilityRate {
  id: string;
  name: string;
  type: "electricity" | "water";
  unit: "kWh" | "m³";
  ratePerUnit: number;
  lastUpdated: string;
  description: string;
}

export interface AmenityFee {
  id: string;
  name: string;
  amount: number;
  billingType: "Fixed Monthly" | "Optional / Add-on";
  description: string;
  isIncluded: boolean;
}

export interface TenantUtilitiesData {
  rates: UtilityRate[];
  amenities: AmenityFee[];
}