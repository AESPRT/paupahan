"use client";

import { useState, useEffect } from "react";
import { TenantHeader } from "@/src/components/tenant/dashboard/TenantHeader";
import { BillingSummaryCards } from "@/src/components/tenant/dashboard/BillingSummaryCards";
import { UtilityUsageCard } from "@/src/components/tenant/dashboard/UtilityUsageCard";
import { ActiveMaintenanceCard } from "@/src/components/tenant/dashboard/ActiveMaintenanceCard";
import { PaymentMethodsCard } from "@/src/components/tenant/dashboard/PaymentMethodsCard";
import { TenantDashboardData } from "@/src/types/tenant/tenant-dashboard";
import { Footer } from "@/src/components/landing/Footer";
import { getTenantDashboardData } from "@/src/actions/tenant/tenant-dashboard-actions";
import { useRouter } from "next/navigation";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function TenantDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<TenantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getTenantDashboardData().then((res) => {
      if (res.success && res.data) {
        setData(res.data as TenantDashboardData);
      } else {
        setErrorMessage(res.error || "May naganap na error.");
        // Kung walang session, ibalik sa login page
        router.push("/tenant/login");
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return <FullPageLoader message="Binubuksan ang Tenant Portal..." />;
  }

  if (errorMessage || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper p-4 text-center">
        <div className="max-w-md space-y-3 rounded-3xl border border-coral/30 bg-coral/10 p-6">
          <h2 className="font-display text-base font-bold text-coral-deep">Access Error</h2>
          <p className="text-xs text-muted">{errorMessage || "Hindi ma-load ang iyong dashboard."}</p>
          <button
            onClick={() => router.push("/tenant/login")}
            className="rounded-xl bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest-deep"
          >
            Mag-log in Ulit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <TenantHeader data={data} />

      {/* 2. Billing Overview Cards */}
      <BillingSummaryCards data={data} />

      {/* 3. Utility Breakdown (Kuryente & Tubig) */}
      <UtilityUsageCard data={data} />

      {/* 4. Active Maintenance Request */}
      {data.activeTicket && <ActiveMaintenanceCard ticket={data.activeTicket} />}

      {/* 5. Payment Options & Landlord Info */}
      <PaymentMethodsCard payments={data.landlordPayments} />

      {/* 6. Footer */}
      <Footer showNavLinks={false} />
    </div>
  );
}