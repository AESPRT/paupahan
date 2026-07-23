"use client";

import { TenantHistoryHeader } from "@/src/components/tenant/history/TenantHistoryHeader";
import { PaidBillsList } from "@/src/components/tenant/history/PaidBillsList";
import { PaidBillHistory } from "@/src/types/tenant/tenant-history";
import { Footer } from "@/src/components/landing/Footer";

// Mock data para sa history ng mga paid bills ni tenant
const MOCK_PAID_BILLS: PaidBillHistory[] = [
  {
    id: "BILL-2026-06",
    billingMonth: "Hunyo 2026",
    paidDate: "Hulyo 2, 2026",
    totalAmount: 6700.00,
    rentAmount: 5000.00,
    electricityAmount: 1100.00,
    waterAmount: 600.00,
    paymentMethod: "GCash",
    referenceNumber: "GCASH-98234123",
    receiptUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "BILL-2026-05",
    billingMonth: "Mayo 2026",
    paidDate: "Hunyo 3, 2026",
    totalAmount: 6550.00,
    rentAmount: 5000.00,
    electricityAmount: 950.00,
    waterAmount: 600.00,
    paymentMethod: "BDO Unibank",
    referenceNumber: "BDO-REF-445512",
    receiptUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
  },
];

export default function TenantHistoryPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <TenantHistoryHeader totalPaidCount={MOCK_PAID_BILLS.length} />

      {/* 2. Listahan ng mga Paid Bills */}
      <PaidBillsList bills={MOCK_PAID_BILLS} />

      {/* 3. Footer */}
      <Footer showNavLinks={false} />
    </div>
  );
}