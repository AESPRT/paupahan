export type UtilityType = "electricity" | "water" | "other" | "amenities";

export interface UtilityRate {
  id: string;
  type: UtilityType;
  name: string;
  ratePerUnit: number; // e.g. 12 per kWh, 35 per m3, 500 flat rate
  unitLabel: string;   // e.g. "kWh", "m³", "Flat Fee"
}

export interface RoomUtilityBill {
  id: string;
  unitName: string;
  roomNumber: string;
  tenantName: string;
  type: UtilityType;
  previousReading?: number;
  currentReading?: number;
  totalAmount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
}