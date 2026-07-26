"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function PaymentCancel() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const referenceNumber = searchParams.get("ref") || searchParams.get("referenceNumber");

  // 🛡️ SECURITY GUARD: Kung walang referenceNumber, ilegal ang pag-access (tinype sa browser)
  useEffect(() => {
    if (!referenceNumber) {
      router.replace("/unauthorized");
    }
  }, [referenceNumber, router]);

  // Habang sinusuri o kung walang reference, huwag munang i-render ang pahina
  if (!referenceNumber) {
    return null;
  }

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

        {/* Reference ID display para mas sigurado */}
        <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-3 mb-6 text-center font-mono text-xs">
          <span className="text-[var(--muted)] block">Reference ID:</span>
          <span className="font-bold text-[var(--ink)]">{referenceNumber}</span>
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