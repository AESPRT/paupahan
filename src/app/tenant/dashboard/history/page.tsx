"use client";

import { useState, useEffect } from "react";
import { TenantHistoryHeader } from "@/src/components/tenant/history/TenantHistoryHeader";
import { PaidBillsList } from "@/src/components/tenant/history/PaidBillsList";
import { PaidBillHistory } from "@/src/types/tenant/tenant-history";
import { Footer } from "@/src/components/landing/Footer";
import { getTenantPaymentHistory } from "@/src/actions/tenant/tenant-history-actions"; // 👈 I-import ang bagong server action
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function TenantHistoryPage() {
  const [bills, setBills] = useState<PaidBillHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const result = await getTenantPaymentHistory();
        if (result.success) {
          setBills(result.history as PaidBillHistory[]);
        }
      } catch (error) {
        console.error("Nabigong i-load ang payment history:", error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return <FullPageLoader message="Nag-a-load ng payment history..." />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <TenantHistoryHeader totalPaidCount={bills.length} />

      {/* 2. Listahan ng mga Paid Bills mula sa Database */}
      {bills.length === 0 ? (
        <div className="rounded-3xl border border-line bg-paper-card p-8 text-center text-xs text-muted">
          Wala ka pang naitalang mga naunang bayarin o payment history.
        </div>
      ) : (
        <PaidBillsList bills={bills} />
      )}

      {/* 3. Footer */}
      <Footer showNavLinks={false} />
    </div>
  );
}