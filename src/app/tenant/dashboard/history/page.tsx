/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { getTenantPaymentHistory } from "@/src/actions/tenant/tenant-history-actions";
import { TenantHistoryHeader } from "@/src/components/tenant/history/TenantHistoryHeader";
import { PaidBillsList } from "@/src/components/tenant/history/PaidBillsList";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function TenantHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const result = await getTenantPaymentHistory();
        if (result.success) {
          setHistory(result.history);
        } else {
          setErrorMsg(result.error || "Nabigong i-load ang history.");
        }
      } catch (error) {
        console.error("Error sa pagkuha ng history:", error);
        setErrorMsg("May naganap na error sa system.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  if (loading) {
    return <FullPageLoader message="Nag-a-load ng kasaysayan ng mga bayad..." />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {errorMsg && (
        <div className="rounded-2xl border border-coral/30 bg-coral/10 p-4 text-xs font-semibold text-coral">
          {errorMsg}
        </div>
      )}

      {/* Header na may kabuuang bilang ng Paid bills */}
      <TenantHistoryHeader totalPaidCount={history.length} />

      {/* Listahan ng mga na-settle na bills */}
      <PaidBillsList bills={history} />
    </div>
  );
}