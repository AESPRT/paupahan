export type TenantStatus = "Active" | "Pending" | "Moving Out" | "Inactive";
export type PaymentStatus = "Paid" | "Pending" | "Overdue";

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  room: string;
  rentAmount: number;
  leaseStart: string;
  leaseEnd: string;
  status: TenantStatus;
  paymentStatus: PaymentStatus;
  avatarUrl?: string;
}