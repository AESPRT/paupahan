"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2, ArrowRight, ReceiptText } from "lucide-react";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const referenceNumber = searchParams.get("ref") || searchParams.get("referenceNumber");
  const planId = searchParams.get("plan") || "";
  const planName = searchParams.get("planName") || "Subscription Plan";
  const name = searchParams.get("name") || "";
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";
  const isChangedPlan = searchParams.get("isChangedPlan") === "true";

  // 🛡️ SECURITY GUARD: Kung walang referenceNumber o plan, ibig sabihin ilegal ang pag-access (tinype sa browser)
  useEffect(() => {
    if (!referenceNumber || !planId) {
      router.replace("/unauthorized");
    }
  }, [referenceNumber, planId, router]);

  // Habang sinusuri o kung walang reference, huwag munang i-render ang pahina para maiwasan ang flash ng UI
  if (!referenceNumber || !planId) {
    return null;
  }

  const handleButtonClick = () => {
    if (!isChangedPlan) {
      // Dalhin sa registration page at ipasa ang lahat ng detalye para automatic mag-fill
      const params = new URLSearchParams({
        referenceNumber,
        plan: planId,
        success: "true",
        name,
        email,
        phone,
      });
      router.push(`/admin/register?${params.toString()}`);
    } else {
      // Kung existing admin na nag-upgrade, diretso na sa subscription page ng dashboard
      router.push(`/admin/dashboard/subscriptions?success=true&planName=${encodeURIComponent(planName)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-[var(--paper-card)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-xl relative perforated overflow-hidden">
        
        {/* Header Icon & Stamp Effect */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--forest)] text-[var(--paper)] mb-4 shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--forest-deep)] font-display">
            Tagumpay ang Pagbabayad!
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1 font-body">
            {!isChangedPlan 
              ? "Matagumpay ang iyong bayad. Mangyaring ituloy ang paggawa ng iyong account."
              : "Maraming salamat. Na-proseso na ang iyong transaksyon at na-update ang iyong subscription."}
          </p>

          {/* Paid Stamp Badge */}
          <div className="absolute top-0 right-0 stamp-anim border-4 border-[var(--marigold)] text-[var(--marigold-deep)] font-black px-3 py-1 rounded-lg uppercase tracking-wider text-xs shadow-sm select-none">
            PAID / VERIFIED
          </div>
        </div>

        {/* Receipt Details Box */}
        <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-4 space-y-3 mb-6 font-mono text-xs sm:text-sm text-[var(--ink)]">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 text-[var(--muted)] font-sans text-xs">
            <span className="flex items-center gap-1">
              <ReceiptText className="w-4 h-4" /> Detalye ng Resibo
            </span>
            <span>Paupahan System</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Reference ID:</span>
            <span className="font-bold">{referenceNumber}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Plan:</span>
            <span className="font-bold capitalize">{planName}</span>
          </div>

          {name && (
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Pangalan:</span>
              <span>{name}</span>
            </div>
          )}

          {email && (
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Email:</span>
              <span className="truncate max-w-[180px]">{email}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleButtonClick}
          className="w-full flex items-center justify-center gap-2 bg-[var(--forest)] hover:bg-[var(--forest-deep)] text-[var(--paper)] font-bold py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer font-display"
        >
          {!isChangedPlan ? "Kumpletuhin ang Account" : "Magtungo sa Dashboard"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}