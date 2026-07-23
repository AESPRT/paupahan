// Aligned sa Prisma Schema Enums
export type UserRole = "landlord" | "staff" | "tenant";
export type RoomStatus = "vacant" | "occupied" | "maintenance";
export type LeaseStatus = "active" | "pending" | "moving_out" | "inactive";
export type BillStatus = "draft" | "pending" | "paid" | "overdue";

export interface Tenant {
  id: string;
  userId?: string | null;
  loginCode: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Lease & Room details
  unitName: string;
  roomNumber: string;
  monthlyRent: number;
  
  // 👈 Mga bagong fields para ma-display din sa frontend kung kinakailangan
  advanceMonths?: number;
  advanceAmount?: number;
  depositMonths?: number;
  depositAmount: number;
  
  leaseStatus: LeaseStatus;
  paymentStatus: BillStatus;
}