import { MaintenanceTicket } from "./tenant-maintenance";

export interface TenantDashboardData {
  tenantName: string;
  roomName: string;
  propertyName: string;
  billingMonth: string;
  totalBillThisMonth: number;
  pendingBalance: number;
  dueDate: string;
  paymentStatus: "Paid" | "Pending" | "Overdue";
  electricity: {
    previousReading: number;
    currentReading: number;
    kwhUsed: number;
    ratePerKwh: number;
    totalAmount: number;
  };
  water: {
    previousReading: number;
    currentReading: number;
    cubicUsed: number;
    ratePerCubic: number;
    totalAmount: number;
  };
  activeTicket?: MaintenanceTicket;
  landlordPayments: {
    gcash?: { number: string; name: string };
    maya?: { number: string; name: string };
    bank?: { bankName: string; accountNumber: string; accountName: string };
  };
}