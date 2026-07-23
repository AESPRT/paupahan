export interface PaidBillHistory {
  id: string;
  billingMonth: string;
  paidDate: string;
  totalAmount: number;
  electricityAmount: number;
  waterAmount: number;
  rentAmount: number;
  paymentMethod: string;
  referenceNumber: string;
  receiptUrl?: string;
}