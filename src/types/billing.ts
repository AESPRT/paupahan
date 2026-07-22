export type BillingStatus = "Paid" | "Pending" | "Overdue";

export interface LineItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  unitRoom: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  totalAmount: number;
  status: BillingStatus;
  paymentMethod?: string;
}