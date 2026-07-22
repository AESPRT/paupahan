"use client";

import { TenantHeader } from "@/src/components/tenant/dashboard/TenantHeader";
import { BillingSummaryCards } from "@/src/components/tenant/dashboard/BillingSummaryCards";
import { UtilityUsageCard } from "@/src/components/tenant/dashboard/UtilityUsageCard";
import { ActiveMaintenanceCard } from "@/src/components/tenant/dashboard/ActiveMaintenanceCard";
import { PaymentMethodsCard } from "@/src/components/tenant/dashboard/PaymentMethodsCard";
import { TenantDashboardData } from "@/src/types/tenant-dashboard";
import { Footer } from "@/src/components/landing/Footer";

const MOCK_TENANT_DATA: TenantDashboardData = {
  tenantName: "Juan Dela Cruz",
  roomName: "Room 102 - Ground Floor",
  propertyName: "Katipunan Residences",
  billingMonth: "Hulyo 2026",
  totalBillThisMonth: 6850.0,
  pendingBalance: 6850.0,
  dueDate: "Hulyo 31, 2026",
  paymentStatus: "Pending",
  electricity: {
    previousReading: 1240,
    currentReading: 1320,
    kwhUsed: 80,
    ratePerKwh: 12.5,
    totalAmount: 1000.0,
  },
  water: {
    previousReading: 310,
    currentReading: 325,
    cubicUsed: 15,
    ratePerCubic: 45.0,
    totalAmount: 675.0,
  },
  activeTicket: {
    id: "TICK-102",
    title: "Sira ang gripo sa banyo",
    category: "Plumbing",
    priority: "Medium",
    status: "In Progress",
    description: "Tumutulo ang tubig sa ilalim ng lababo kahit nakasara na nang husto.",
    photoUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
    createdAt: "Hulyo 20, 2026",
  },
  landlordPayments: {
    gcash: { number: "09171234567", name: "Pedro Penduko (Landlord)" },
    bank: { bankName: "BDO Unibank", accountNumber: "001234567890", accountName: "Pedro Penduko" },
  },
};

export default function TenantDashboardPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <TenantHeader data={MOCK_TENANT_DATA} />

      {/* 2. Billing Overview Cards */}
      <BillingSummaryCards data={MOCK_TENANT_DATA} />

      {/* 3. Utility Breakdown (Kuryente & Tubig) */}
      <UtilityUsageCard data={MOCK_TENANT_DATA} />

      {/* 4. Active Maintenance Request (May kasamang mock image preview) */}
      <ActiveMaintenanceCard ticket={MOCK_TENANT_DATA.activeTicket} />

      {/* 5. Payment Options & Landlord Info */}
      <PaymentMethodsCard payments={MOCK_TENANT_DATA.landlordPayments} />

      {/* 6. Footer */}
      <Footer showNavLinks={false} />
    </div>
  );
}