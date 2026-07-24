/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { submitPaymentAction } from "@/src/actions/tenant/tenant-actions";

interface PaymentViewProps {
  billId: string;
  tenantId: string;
  monthYear: string;
  totalAmount: number;
  dueDate: string;
  landlordPaymentSettings?: any;
}

export function PaymentView({ 
  billId, 
  tenantId, 
  monthYear, 
  totalAmount, 
  dueDate,
  landlordPaymentSettings 
}: PaymentViewProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const settings = landlordPaymentSettings || {};

  // Sinasalo ang parehong camelCase at snake_case mula sa database/json
  const isGcashActive = Boolean(settings.isGcashActive || settings.is_gcash_active);
  const isMayaActive = Boolean(settings.isMayaActive || settings.is_maya_active);
  const isBankActive = Boolean(settings.isBankActive || settings.is_bank_active);

  const gcashName = settings.gcashName || settings.gcash_name || "";
  const gcashNumber = settings.gcashNumber || settings.gcash_number || "";
  const mayaName = settings.mayaName || settings.maya_name || "";
  const mayaNumber = settings.mayaNumber || settings.maya_number || "";

  // Dynamic list ng mga available payment methods
  const availableMethods = [
    { id: "cash", label: "Cash", sub: "Direkta sa Landlord", icon: "💵", color: "bg-emerald-600" },
    ...(isGcashActive ? [{ id: "gcash", label: "GCash", sub: "Online Transfer", icon: "G", color: "bg-blue-500" }] : []),
    ...(isMayaActive ? [{ id: "maya", label: "Maya", sub: "Online Transfer", icon: "M", color: "bg-green-600" }] : []),
    ...(isBankActive ? [{ id: "bank", label: "Bank Transfer", sub: "Online Transfer", icon: "🏦", color: "bg-indigo-600" }] : []),
  ];

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

      const result = await submitPaymentAction(formData);

      if (result.success) {
        alert(result.message);
        window.location.href = "/tenant/dashboard/home";
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
        {/* Dynamic Selection Options */}
        <div className="space-y-3">
          <label className="font-display text-xs font-bold uppercase tracking-wider text-muted">
            Piliin ang Paraan ng Pagbabayad
          </label>
          <div className={`grid gap-3 sm:gap-4 ${
            availableMethods.length === 1 ? "grid-cols-1" : 
            availableMethods.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
          }`}>
            {availableMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                  selectedMethod === method.id
                    ? "border-forest bg-forest/5 text-forest-deep shadow-xs ring-2 ring-forest/20"
                    : "border-line bg-paper-card text-muted hover:bg-paper"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-sm ${method.color}`}>
                  {method.icon}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-forest-deep">{method.label}</p>
                  <p className="text-[10px] text-muted">{method.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Details based on Selected Method */}
        {selectedMethod === "cash" && (
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

        {selectedMethod === "gcash" && (
          <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
              Mga Hakbang sa GCash
            </h3>
            <div className="rounded-2xl bg-paper p-4 text-xs text-muted space-y-2 border border-line/60">
              <p>1. Mag-transfer ng eksaktong halaga sa pamamagitan ng GCash:</p>
              <p className="font-mono-brand font-bold text-forest-deep">
                Pangalan: {gcashName || "Hindi pa na-setup"}
              </p>
              <p className="font-mono-brand font-bold text-forest-deep">
                Number: {gcashNumber || "Wala pang numero"}
              </p>
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
        )}

        {selectedMethod === "maya" && (
          <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
              Mga Hakbang sa Maya
            </h3>
            <div className="rounded-2xl bg-paper p-4 text-xs text-muted space-y-2 border border-line/60">
              <p>1. Mag-transfer ng eksaktong halaga sa pamamagitan ng Maya:</p>
              <p className="font-mono-brand font-bold text-forest-deep">
                Pangalan: {mayaName || "Hindi pa na-setup"}
              </p>
              <p className="font-mono-brand font-bold text-forest-deep">
                Number: {mayaNumber || "Wala pang numero"}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-forest-deep">Maya Reference Number (Ref No.)</label>
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