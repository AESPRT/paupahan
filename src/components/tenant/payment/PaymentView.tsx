"use client";

import { useState } from "react";
import { submitPaymentAction } from "@/src/actions/tenant/tenant-actions"; // I-import ang action

interface PaymentViewProps {
  billId: string;
  tenantId: string; // ✨ Idinagdag para sa database relation
  monthYear: string;
  totalAmount: number;
  dueDate: string;
}

export function PaymentView({ billId, tenantId, monthYear, totalAmount, dueDate }: PaymentViewProps) {
  const [selectedMethod, setSelectedMethod] = useState<"gcash" | "cash">("gcash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("billId", billId);
      formData.append("tenantId", tenantId);
      formData.append("paymentMethod", selectedMethod);
      formData.append("amount", totalAmount.toString());
      formData.append("referenceNo", referenceNumber);
      // Kung may file upload ka para sa resibo, i-append din dito ang URL/Path nito
      // formData.append("receiptUrl", uploadedFileUrl);

      const result = await submitPaymentAction(formData);

      if (result.success) {
        alert(result.message);
        // Maaari kang mag-redirect dito patungong dashboard
        window.location.href = "/tenant/dashboard";
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Nagkaroon ng problema sa pagproseso ng iyong bayad.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Page Header */}
      <div className="space-y-1">
        <span className="font-mono-brand text-xs uppercase font-bold text-muted">
          Bill ID: {billId}
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-forest-deep">
          Magbayad para sa {monthYear}
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Piliin ang iyong paraan ng pagbabayad at kumpletuhin ang mga detalye sa ibaba.
        </p>
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <span className="text-xs sm:text-sm font-bold text-muted">Kabuuang Babayaran</span>
          <span className="font-display text-2xl sm:text-3xl font-black text-forest-deep">
            ₱{totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>Petsa ng Deadline (Due Date):</span>
          <span className="font-bold text-forest-deep">{dueDate}</span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handlePaymentSubmit} className="space-y-6">
        {/* Selection: GCash or Cash */}
        <div className="space-y-3">
          <label className="font-display text-xs font-bold uppercase tracking-wider text-muted">
            Piliin ang Paraan ng Pagbabayad
          </label>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* GCash Option */}
            <button
              type="button"
              onClick={() => setSelectedMethod("gcash")}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                selectedMethod === "gcash"
                  ? "border-forest bg-forest/5 text-forest-deep shadow-xs ring-2 ring-forest/20"
                  : "border-line bg-paper-card text-muted hover:bg-paper"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white font-bold text-sm">
                G
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-forest-deep">GCash</p>
                <p className="text-[10px] text-muted">Online Transfer</p>
              </div>
            </button>

            {/* Cash Option */}
            <button
              type="button"
              onClick={() => setSelectedMethod("cash")}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                selectedMethod === "cash"
                  ? "border-forest bg-forest/5 text-forest-deep shadow-xs ring-2 ring-forest/20"
                  : "border-line bg-paper-card text-muted hover:bg-paper"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                💵
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-forest-deep">Cash</p>
                <p className="text-[10px] text-muted">Direkta sa Landlord</p>
              </div>
            </button>
          </div>
        </div>

        {/* Conditional Details based on Selected Method */}
        {selectedMethod === "gcash" ? (
          <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
              Mga Hakbang sa GCash
            </h3>
            <div className="rounded-2xl bg-paper p-4 text-xs text-muted space-y-2 border border-line/60">
              <p>1. Mag-transfer ng eksaktong halaga sa pamamagitan ng GCash:</p>
              <p className="font-mono-brand font-bold text-forest-deep">Pangalan: Juan Dela Cruz</p>
              <p className="font-mono-brand font-bold text-forest-deep">Number: 0912-345-6789</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-forest-deep">GCash Reference Number (Ref No.)</label>
              <input
                type="text"
                required
                placeholder="Hal. 1029384756"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-mono-brand text-xs sm:text-sm text-forest-deep outline-none focus:border-forest"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-forest-deep">Mag-upload ng Screenshot ng Resibo</label>
              <input
                type="file"
                accept="image/*"
                required
                className="w-full text-xs text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-forest/10 file:px-4 file:py-2.5 file:font-mono-brand file:text-xs file:font-bold file:text-forest hover:file:bg-forest/20"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
              Mga Tagubilin sa Cash Payment
            </h3>
            <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Paalala:</p>
              <p className="leading-snug">
                Mangyaring dalhin ang eksaktong halaga ng cash diretso sa opisina o sa iyong landlord. Kapag tinanggap na ito, ia-update ang status ng iyong bill sa system.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-forest py-4 font-mono-brand text-xs sm:text-sm font-bold text-white shadow-md hover:bg-forest-deep transition-all active:scale-98 disabled:opacity-50"
        >
          {isSubmitting ? "Pinoproseso ang Bayad..." : "Isumite ang Bayad (Submit Payment)"}
        </button>
      </form>
    </div>
  );
}