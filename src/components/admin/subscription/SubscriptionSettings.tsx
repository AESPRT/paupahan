"use client";

import { useState, useTransition } from "react";
import { CurrentSubscription } from "@/src/types/admin/subscription";

interface SubscriptionSettingsProps {
  subscription: CurrentSubscription;
  onAutoRenewToggle?: (newState: boolean) => Promise<void>;
  onChangePaymentMethod?: () => void;
}

export function SubscriptionSettings({
  subscription,
  onAutoRenewToggle,
  onChangePaymentMethod,
}: SubscriptionSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticAutoRenew, setOptimisticAutoRenew] = useState<boolean | null>(null);

  const autoRenew = optimisticAutoRenew ?? subscription.autoRenew ?? true;

  const handleToggle = () => {
    const nextState = !autoRenew;
    setOptimisticAutoRenew(nextState);

    startTransition(async () => {
      if (onAutoRenewToggle) {
        try {
          await onAutoRenewToggle(nextState);
        } catch (error) {
          console.error("Nabigong baguhin ang auto-renew status:", error);
          setOptimisticAutoRenew(null);
        }
      }
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-paper-card p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper text-forest border border-line shadow-sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-bold text-muted border border-line mb-1 font-mono-brand">
              BILLING & RENEWALS
            </div>
            <h3 className="text-lg font-black tracking-tight text-ink font-display">
              Mga Detalye ng Auto-Renew at Pagbabayad
            </h3>
            <p className="text-xs text-muted font-body">
              Pamahalaan ang iyong awtomatikong pagbabayad at paraan ng paniningil.
            </p>
          </div>
        </div>
        
        {/* Auto-renew Toggle Switch */}
        <div className="flex items-center gap-3 self-end sm:self-center bg-paper px-4 py-2.5 rounded-2xl border border-line">
          <span className="text-xs font-bold text-ink font-mono-brand">
            {autoRenew ? "Auto-Renew ON" : "Auto-Renew OFF"}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-marigold focus:ring-offset-2 ${
              autoRenew ? "bg-forest shadow-sm" : "bg-line"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-paper-card shadow-md ring-0 transition duration-200 ease-in-out ${
                autoRenew ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2">
        
        {/* Payment Method Card */}
        <div className="group rounded-2xl bg-paper p-5 border border-line flex flex-col justify-between transition-all hover:border-forest/40">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted font-mono-brand">
              <svg className="h-4 w-4 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Naka-save na Payment Method
            </div>
            
            <p className="mt-2 text-sm font-bold text-ink font-display flex items-center gap-2">
              {subscription.paymentMethod || "GCash / Credit Card (Naka-link)"}
            </p>

            {subscription.paymentNumber && (
              <p className="mt-1 text-xs font-mono-brand text-muted">
                Numero/Account: <span className="font-bold text-ink">{subscription.paymentNumber}</span>
              </p>
            )}
            
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-2.5 py-0.5 text-[11px] font-semibold text-forest font-mono-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-marigold animate-pulse" />
              Handang mangolekta sa susunod na siklo
            </div>
          </div>
          
          {onChangePaymentMethod && (
            <button 
              onClick={onChangePaymentMethod}
              className="mt-5 inline-flex items-center gap-1 self-start text-xs font-bold text-coral transition-colors hover:text-coral-deep group-hover:translate-x-0.5 transform duration-200 font-mono-brand"
            >
              <span>Baguhin ang Payment Method</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Next Billing Info Card */}
        <div className="rounded-2xl bg-paper p-5 border border-line flex flex-col justify-between transition-all hover:border-forest/40">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted font-mono-brand">
              <svg className="h-4 w-4 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Susunod na Singil
            </div>

            <p className="mt-2 text-sm font-black text-ink font-display">
              {subscription.renewsOn}
            </p>

            <p className="mt-2 text-xs text-muted font-body leading-relaxed">
              {autoRenew 
                ? "Awtomatikong sisingilin ang iyong account sa takdang petsa." 
                : "Hindi na ito magre-renew pagkalipas ng petsang ito maliban kung i-on mo muli."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}