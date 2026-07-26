"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, RefreshCcw, ArrowLeft } from "lucide-react";

export default function PaymentFailed() {
  const searchParams = useSearchParams();
  const referenceNumber = searchParams.get("ref") || "TXN-RENTAL-XXXXXX";

  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-[var(--paper-card)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-xl relative perforated overflow-hidden">
        
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--coral)] text-[var(--paper)] mb-4 shadow-md">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--coral-deep)] font-display">
            Nabigo ang Pagbabayad
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1 font-body">
            Nagkaroon ng problema sa pag-proseso ng iyong bayad o kaya ay tinanggihan ito.
          </p>
        </div>

        {/* Reference Box */}
        <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-4 mb-6 text-center">
          <span className="text-xs text-[var(--muted)] block font-mono">Reference Number:</span>
          <span className="text-sm font-bold font-mono text-[var(--ink)]">{referenceNumber}</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/admin/dashboard/subscriptions")}
            className="w-full flex items-center justify-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-deep)] text-[var(--paper)] font-bold py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer font-display"
          >
            <RefreshCcw className="w-4 h-4" /> Subukang Muli ang Pagbabayad
          </button>

          <button
            onClick={() => router.push("/admin/dashboard/subscriptions")}
            className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] font-bold py-3 px-4 rounded-xl transition-all cursor-pointer font-display"
          >
            <ArrowLeft className="w-4 h-4" /> Bumalik sa Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}