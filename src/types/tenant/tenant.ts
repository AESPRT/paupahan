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
  
  // Lease & Room/Unit details
  unitName: string;
  roomNumber?: string; // 👈 Ginawang opsyonal (?) para hindi mag-error kapag Unit-level ang upa
  monthlyRent: number;
  
  // Mga karagdagang fields para sa advance at deposit
  advanceMonths?: number;
  advanceAmount?: number;
  depositMonths?: number;
  depositAmount: number;
  
  leaseStatus: LeaseStatus;
  paymentStatus: BillStatus;
}