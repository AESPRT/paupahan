export type BillStatus = "Draft Pending Readings" | "Pending Payment" | "Paid" | "Overdue" | "Pending Landlord Approval";

export interface UtilityItem {
  type: "electricity" | "water";
  previousReading: number;
  currentReading?: number;
  ratePerUnit: number;
  unitLabel: string; // "kWh" o "m³"
  proofPhotoUrl?: string;
  status: "Pending Tenant Input" | "Pending Landlord Approval" | "Approved";
}

// ✨ Idagdag ang AmenityItem interface para sa listahan
export interface AmenityItem {
  name: string;
  amount: number;
  frequency?: string | null;
}

export interface TenantBill {
  id: string;
  monthYear: string; // e.g. "Hulyo 2026"
  dueDate: string;
  status: BillStatus;
  
  // Fixed Charges
  rentAmount: number;
  amenitiesFee: number; 
  amenitiesList?: AmenityItem[]; // 👈 Idagdag ito rito para makilala ng TypeScript
  
  // Dynamic Utilities
  electricity: UtilityItem;
  water: UtilityItem;
  
  // Total
  totalAmount: number;
  
  paymentReceiptUrl?: string;
  paidAt?: string;
}