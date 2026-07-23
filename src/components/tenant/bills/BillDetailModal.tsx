"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✨ 1. I-import ang useRouter
import { TenantBill } from "@/src/types/tenant/tenant-bill";
import { ReadingUploadModal } from "./ReadingUploadModal";

interface BillDetailModalProps {
  bill: TenantBill | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUtility: (
    billId: string,
    utilityType: "electricity" | "water",
    reading: number,
    photoUrl: string
  ) => void;
}

export function BillDetailModal({
  bill,
  isOpen,
  onClose,
  onUpdateUtility,
}: BillDetailModalProps) {
  const router = useRouter(); // ✨ 2. Gamitin ang router hook
  const [uploadUtilityType, setUploadUtilityType] = useState<"electricity" | "water" | null>(null);

  if (!isOpen || !bill) return null;

  // Utility Cost Calculation
  const elecUsed = bill.electricity.currentReading
    ? bill.electricity.currentReading - bill.electricity.previousReading
    : 0;
  const elecCost = elecUsed * bill.electricity.ratePerUnit;

  const waterUsed = bill.water.currentReading
    ? bill.water.currentReading - bill.water.previousReading
    : 0;
  const waterCost = waterUsed * bill.water.ratePerUnit;

  // Total computation kung aprobadong pareho
  const computedTotal = bill.rentAmount + bill.amenitiesFee + elecCost + waterCost;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-2xl animate-in fade-in duration-200 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <span className="font-mono-brand text-[10px] uppercase font-bold text-muted">
                Bill ID: {bill.id}
              </span>
              <h2 className="font-display text-xl font-bold text-forest-deep">
                Bill Details - {bill.monthYear}
              </h2>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 text-muted hover:bg-paper">
              {/* Close SVG Icon */}
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Notice Alert Box */}
          {bill.status === "Draft Pending Readings" && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                {/* Warning Triangle SVG Icon */}
                <svg className="h-4 w-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Nakabinbin ang Submeter Reading</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Paki-input ang kasalukuyang reading at kumuha ng litrato ng meter ng iyong kuryente at tubig sa ibaba para ma-kalkula ng landlord ang iyong kabuuang bill.
              </p>
            </div>
          )}

          {/* Breakdown Items List */}
          <div className="space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
              Mga Bahagi ng Bayarin (Breakdown)
            </h3>

            {/* 1. House Rent (Fixed) */}
            <div className="flex items-center justify-between rounded-2xl bg-paper p-3.5 border border-line/60">
              <div className="flex items-center gap-2.5">
                {/* Home SVG Icon */}
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-forest-deep">Upa sa Bahay / Kwarto (House Rent)</p>
                  <p className="text-[10px] text-muted">Fixed Monthly Rate</p>
                </div>
              </div>
              <span className="font-mono-brand text-xs font-bold text-forest-deep">
                ₱{bill.rentAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* 2. Fixed Amenities */}
            <div className="flex items-center justify-between rounded-2xl bg-paper p-3.5 border border-line/60">
              <div className="flex items-center gap-2.5">
                {/* Sparkles / Amenities SVG Icon */}
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-forest-deep">Fixed Amenities & Dues</p>
                  <p className="text-[10px] text-muted">Basura, Wi-Fi & Maintenance fee</p>
                </div>
              </div>
              <span className="font-mono-brand text-xs font-bold text-forest-deep">
                ₱{bill.amenitiesFee.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* 3. Electricity (Submeter Input required) */}
            <div className="rounded-2xl bg-paper p-3.5 border border-line/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Lightning SVG Icon */}
                  <svg className="h-4 w-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-bold text-forest-deep">Kuryente (Submeter)</span>
                </div>
                
                {/* Utility Input Action / Status */}
                {bill.electricity.status === "Pending Tenant Input" && (
                  <button
                    onClick={() => setUploadUtilityType("electricity")}
                    className="rounded-xl bg-forest px-3 py-1 font-mono-brand text-[10px] font-bold text-white hover:bg-forest-deep shadow-xs"
                  >
                    + Input Reading & Photo
                  </button>
                )}

                {bill.electricity.status === "Pending Landlord Approval" && (
                  <span className="flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono-brand text-[10px] font-bold text-amber-800">
                    {/* Clock SVG Icon */}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Waiting Approval
                  </span>
                )}

                {bill.electricity.status === "Approved" && (
                  <span className="font-mono-brand text-xs font-bold text-forest-deep">
                    ₱{elecCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {/* Utility Reading Details */}
              {bill.electricity.currentReading && (
                <div className="flex justify-between items-center pt-1 border-t border-line/40 font-mono-brand text-[11px] text-muted">
                  <span className="flex items-center gap-1">
                    Reading: {bill.electricity.previousReading}
                    {/* Arrow Right SVG */}
                    <svg className="h-3 w-3 inline text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    {bill.electricity.currentReading} kWh ({elecUsed} kWh)
                  </span>
                  {bill.electricity.proofPhotoUrl && (
                    <span className="text-forest font-bold flex items-center gap-1">
                      {/* Camera SVG Icon */}
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      May Litrato
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 4. Water (Submeter Input required) */}
            <div className="rounded-2xl bg-paper p-3.5 border border-line/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Water Drop SVG Icon */}
                  <svg className="h-4 w-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="text-xs font-bold text-forest-deep">Tubig (Submeter)</span>
                </div>
                
                {/* Utility Input Action / Status */}
                {bill.water.status === "Pending Tenant Input" && (
                  <button
                    onClick={() => setUploadUtilityType("water")}
                    className="rounded-xl bg-forest px-3 py-1 font-mono-brand text-[10px] font-bold text-white hover:bg-forest-deep shadow-xs"
                  >
                    + Input Reading & Photo
                  </button>
                )}

                {bill.water.status === "Pending Landlord Approval" && (
                  <span className="flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono-brand text-[10px] font-bold text-amber-800">
                    {/* Clock SVG Icon */}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Waiting Approval
                  </span>
                )}

                {bill.water.status === "Approved" && (
                  <span className="font-mono-brand text-xs font-bold text-forest-deep">
                    ₱{waterCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {/* Utility Reading Details */}
              {bill.water.currentReading && (
                <div className="flex justify-between items-center pt-1 border-t border-line/40 font-mono-brand text-[11px] text-muted">
                  <span className="flex items-center gap-1">
                    Reading: {bill.water.previousReading}
                    {/* Arrow Right SVG */}
                    <svg className="h-3 w-3 inline text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    {bill.water.currentReading} m³ ({waterUsed} m³)
                  </span>
                  {bill.water.proofPhotoUrl && (
                    <span className="text-forest font-bold flex items-center gap-1">
                      {/* Camera SVG Icon */}
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      May Litrato
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Grand Total Footer */}
          <div className="rounded-2xl bg-forest/10 p-4 border border-forest/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono-brand text-[10px] uppercase font-bold text-forest-deep">
                  Kabuuang Bayarin (Total Bill)
                </p>
                <p className="text-[11px] text-muted">Due Date: {bill.dueDate}</p>
              </div>
              <div className="font-display text-xl font-black text-forest-deep">
                {bill.status === "Draft Pending Readings" || bill.status === "Pending Landlord Approval" ? (
                  <span className="text-xs font-normal text-amber-800 font-mono-brand">
                    Kailangan muna ng Approved Readings
                  </span>
                ) : (
                  `₱${computedTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                )}
              </div>
            </div>

            {/* ✨ PAY BUTTON: Magre-redirect sa payment page gamit ang bill.id */}
            {bill.status === "Pending Payment" && (
              <button
                onClick={() => {
                  router.push(`/tenant/payment/${bill.id}`);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest py-3 font-mono-brand text-xs font-bold text-white shadow-md hover:bg-forest-deep transition-all active:scale-95"
              >
                {/* Credit Card / Payment Icon */}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Magbayad Na (Pay Now)</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-line py-3 font-mono-brand text-xs font-bold text-muted hover:bg-paper"
          >
            Isara (Close)
          </button>
        </div>
      </div>

      {/* Upload Reading Modal (Lalabas kapag in-open) */}
      {uploadUtilityType && (
        <ReadingUploadModal
          isOpen={!!uploadUtilityType}
          onClose={() => setUploadUtilityType(null)}
          utilityType={uploadUtilityType}
          utilityData={uploadUtilityType === "electricity" ? bill.electricity : bill.water}
          onSubmitReading={(type, reading, photoUrl) => {
            onUpdateUtility(bill.id, type, reading, photoUrl);
          }}
        />
      )}
    </>
  );
}