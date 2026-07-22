export type BillStatus = "Draft Pending Readings" | "Pending Payment" | "Paid" | "Overdue";

export interface UtilityItem {
  type: "electricity" | "water";
  previousReading: number;
  currentReading?: number;
  ratePerUnit: number;
  unitLabel: string; // "kWh" o "m³"
  proofPhotoUrl?: string;
  status: "Pending Tenant Input" | "Pending Landlord Approval" | "Approved";
}

export interface TenantBill {
  id: string;
  monthYear: string; // e.g. "Hulyo 2026"
  dueDate: string;
  status: BillStatus;
  
  // Fixed Charges (Naka-set na mula sa Landlord)
  rentAmount: number;
  amenitiesFee: number; // e.g. Garbage fee, Condo dues, Wi-Fi
  
  // Dynamic Utilities
  electricity: UtilityItem;
  water: UtilityItem;
  
  // Total (Kalkulado kapag approved na ang utilities)
  totalAmount: number;
  
  paymentReceiptUrl?: string;
  paidAt?: string;
}