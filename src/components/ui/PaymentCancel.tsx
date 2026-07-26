"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function PaymentCancel() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-[var(--paper-card)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-xl relative perforated overflow-hidden">
        
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--marigold)] text-[var(--paper)] mb-4 shadow-md">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--marigold-deep)] font-display">
            Kinansela ang Transaksyon
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1 font-body">
            Itinigil mo ang proseso ng pagbabayad. Walang anumang halaga ang ibinawas sa iyong account.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => router.push("/admin/dashboard/subscriptions")}
          className="w-full flex items-center justify-center gap-2 bg-[var(--forest)] hover:bg-[var(--forest-deep)] text-[var(--paper)] font-bold py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer font-display"
        >
          <ArrowLeft className="w-4 h-4" /> Bumalik sa Subscriptions
        </button>
      </div>
    </div>
  );
}