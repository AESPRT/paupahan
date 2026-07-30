// Aligned sa Prisma Schema Enums
export type UserRole = "landlord" | "staff" | "tenant";
export type RoomStatus = "vacant" | "occupied" | "reserved" | "maintenance";
export type LeaseStatus = "active" | "pending" | "moving_out" | "inactive";
export type BillStatus = "draft" | "pending" | "payment_submitted" | "paid" | "overdue";

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

  // 👈 Mga bagong dinagdag para sa Moved In Date at Due Date
  movedInDate?: string | Date | null;
  startDate?: string | Date | null; // Alias/Compatibility para sa lease start date
  dueDate?: number | string | null; // Araw ng buwan o eksaktong petsa ng due
  dueDay?: number | string | null;  // Alias/Compatibility para sa due day

  leaseStatus: LeaseStatus;
  paymentStatus: BillStatus;
}